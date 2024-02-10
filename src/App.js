import { useState, useEffect } from "react";
import './App.css';
import json from './assets/panda-fc.json';
import CircularProgress from '@mui/joy/CircularProgress';

function App() {
  const countDownTime = 30;
  const totalPlayersInAuction = json.totalPlayersInAuction;
  const [playersSold, setPlayersSold] = useState(0);
  const [franchise, setFranchise] = useState(json.franchise);
  const [players, setPlayers] = useState(json.players);
  const [selectedPlayer, setSelectedPlayer] = useState({});
  const [auctionStatus, setAuctionStatus] = useState("NOT STARTED");
  const [countdown, setCountdown] = useState(countDownTime);
  const [bidStatus, setBidStatus] = useState("NOT STARTED");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (countdown === 0) {
        if(bidStatus === "ONGOING"){
          updatedBidResult();
          setBidStatus("FINISHED");
        }
        return;
      }
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  });

  const updatedBidResult = () => {
    const status = (selectedPlayer.sellPrice >= selectedPlayer.basePrice && selectedPlayer.franchiseId !== "") ? "sold" : "unsold";
    const updatedPlayer = {...selectedPlayer, status};

    setSelectedPlayer(updatedPlayer);

    setPlayers(prevState => ([
      ...prevState.map((player) => {
        if (player.id === selectedPlayer.id) {
          return updatedPlayer;
        }
        return player
      })
    ]));

    if(updatedPlayer.status === "sold"){
      setFranchise(prevState => ([
        ...prevState.map(franchise => {
          if (franchise.id === updatedPlayer.franchiseId) {
            return {
              ...franchise,
              purseBalance: franchise.purseBalance - updatedPlayer.sellPrice,
              players: [...franchise.players, updatedPlayer.id]
            }
          }
          return franchise;
        })
      ]));
      console.log(playersSold)
      if (playersSold + 1 === totalPlayersInAuction) {
        finishAuction();
      }
      setPlayersSold((prevState) => prevState + 1); 
      
    }
  }

  const selectRandomPlayer = () => {
    const drawPlayers = players.filter(
        player => player.status === "" && player.isOwner !== "true"
    );

    let unsoldPlayers = players.filter(
      player => player.status === "unsold" && player.isOwner !== "true" && !player.isDrawn
    );
    if (unsoldPlayers.length === 0) {
      setPlayers(prevState => ([
        ...prevState.map(
          player => {
            if (player.status === "unsold" && player.isOwner !== "true")
              return {...player, isDrawn: false};
            return player;
          }
        )
      ]))
      unsoldPlayers = players.filter(
        player => player.status === "unsold" && player.isOwner !== "true"
      );
    }

    if (drawPlayers.length > 0)
      return getRandomPlayer(drawPlayers);
    else if (unsoldPlayers.length > 0);
      return getRandomPlayer(unsoldPlayers);

  }

  const beginAuction = () => {
    setAuctionStatus("ONGOING");
    setBidStatus("ONGOING");
    setCountdown(countDownTime);
  }

  const finishAuction = () => {
    setAuctionStatus("FINISHED");
    setBidStatus("FINISHED");
    setCountdown(0);
  }

  const startAuction = () => {
    const player = selectRandomPlayer();
    player.status = "";
    player.isDrawn = true;

    if(player){
      setSelectedPlayer(player);
      beginAuction();
    }
    else{
      finishAuction();
    } 
  }

  const getRandomPlayer = (playersList) => {
    const random = Math.random()
    const randomIndex = Math.floor(random * playersList.length);
    return playersList[randomIndex];
  };

  const getFranchiseColorGradientButton = (franchiseId) => {
    const selectedFranchise = franchise.find((franchise) => franchise.id === franchiseId);
    return selectedFranchise.colorGradientButton;
  }

  const getFranchiseColor = (franchiseId) => {
    const selectedFranchise = franchise.find((franchise) => franchise.id === franchiseId);
    return selectedFranchise.color;
  }

  const getKeyFrames = () => {
    let color = "#8743fd";
    let gradientColor = "#ffffff";
    if (selectedPlayer.franchiseId !== "") {
      color = getFranchiseColor(selectedPlayer.franchiseId);
      gradientColor = getFranchiseColorGradientButton(selectedPlayer.franchiseId)
    }
    const keyframes = `
      @keyframes blink {
        0% {
          background: linear-gradient(131.47deg, ${color}ba, 6.7%, ${color}ba 6.71%, ${gradientColor}90 53.86%, ${color}ba 95.58%);
        }
        50% {
          background: #ffffff00;
        }
        100% {
          background: linear-gradient(131.47deg, ${color}ba, 6.7%, ${color}ba 6.71%, ${gradientColor}90 53.86%, ${color}ba 95.58%);
        }
      }

      .blinking-name-background {
        animation: blink ${countdown > 10 ? 2 : 1}s infinite;
        animation-timing-function: linear;
      }
    `;
    return keyframes;
  }

  const getZoomFrames = () => {
    const keyframes = `
      @keyframes zoomAnimation {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.5);
        }
        100% {
          transform: scale(1);
        }
      }

      .player-auction-pending-time {
        animation: zoomAnimation ${countdown > 10? 2 : 1}s infinite;
      }
    `;
    return keyframes;
  }

  const playerTableEntryPartial = (playersList, startIndex, lastIndex) => {
    return (
      <table>
          <thead>
            <tr>
              <th>PLAYERS</th>
              <th>BASE PRICE</th>
              <th>BID PRICE</th>
            </tr>
          </thead>
          <tbody>
            {playersList.slice(startIndex,lastIndex).map(player => 
              {
              return(
                <>
                  {selectedPlayer && selectedPlayer.id === player.id && selectedPlayer.status === "" &&
                  <style>{getKeyFrames()}</style>
                  }
                  <tr 
                    className={selectedPlayer && selectedPlayer.id === player.id && selectedPlayer.status === "" ? "blinking-name-background" : ""}
                    style={{
                      'background': `${player.status === "sold" ? `linear-gradient(131.47deg, ${getFranchiseColor(player.franchiseId)}ba, 6.7%, ${getFranchiseColor(player.franchiseId)}ba 6.71%, ${getFranchiseColorGradientButton(player.franchiseId)}ba 53.86%, ${getFranchiseColor(player.franchiseId)}ba 95.58%)` : ""}`
                    }}
                  >
                    <td className="player-name">
                      <div className={player.status === "" ? "player-status" : "player-status " + player.status}/>
                      {player.name}
                    </td>
                    <td>{`${player.basePrice} L`}</td>
                    <td>{player.sellPrice === 0 ? "-" : `${player.sellPrice} L`} </td>
                  </tr>
                </> 
              )
            })}
          </tbody>
      </table>
    )
  }

  const playerTableEntry = () => {
    const playersList = players.filter(player => player.isOwner !== "true");
    const playersLength = playersList.length;

    return(
      <div className="players-table-wrappper">
        {playerTableEntryPartial(playersList, 0, playersLength/2)}
        {playerTableEntryPartial(playersList, playersLength/2, playersLength)}
      </div>
    )
  }

  const playerStats = (stats) => {
    return (
      <div className="player-card-stats-section">
        <div>{stats.value}</div>
        <div>{stats.skill}</div>
      </div>
    )
  } 

  const selectedPlayerStats = () => {
    return(
      <div className="player-card-stats-container">
        {selectedPlayer && selectedPlayer.stats && selectedPlayer.stats.stats && 
          <>
            <div className="player-card-stats">
              {selectedPlayer.stats.stats.slice(0, selectedPlayer.stats.stats.length/2).map((stats) => {
                return playerStats(stats)
              })}
            </div>
            <div className="player-card-vertical-line" />
            <div className="player-card-stats">
              {selectedPlayer.stats.stats.slice(selectedPlayer.stats.stats.length/2, selectedPlayer.stats.stats.length).map((stats) => {
                return playerStats(stats)
              })}
            </div>
          </>
        }
      </div>
    )
  }

  const makePlayerBid = (franchiseId) => {
    let sellPrice = selectedPlayer.sellPrice;
    if (selectedPlayer.franchiseId === "" && selectedPlayer.sellPrice === 0) {
      sellPrice += selectedPlayer.basePrice;
    }else{
      sellPrice += 10; 
    }

    setSelectedPlayer(prevState => ({
      ...prevState,
      sellPrice,
      franchiseId
    }));

    setCountdown(countDownTime);
  }

  const minimumBidPriceOfUnsoldPlayersRequired = (noOfPlayersRequired) => {
    let sortedPlayers = players.filter(player => player.id !== selectedPlayer.id && player.status !== "sold" && player.isOwner !== "true");
    sortedPlayers.sort((a,b) => a.basePrice-b.basePrice);
    let sum = 0;
    for (let i = 0; i < noOfPlayersRequired; i++) {
      sum += sortedPlayers[i].basePrice;
    }
    console.log(noOfPlayersRequired);
    console.log(sortedPlayers);
    console.log(sum);
    return sum;
    
  } 

  const isBidDisabled = (selectedFranchise) => {
    let isDisabled = false;    
    if ((bidStatus === "FINISHED") ||
        (selectedPlayer && selectedPlayer.franchiseId === selectedFranchise.id) ||
        (selectedFranchise.players.length >= selectedFranchise.maxPlayers) ||
        ((selectedPlayer.sellPrice + 10) > selectedFranchise.purseBalance - minimumBidPriceOfUnsoldPlayersRequired(selectedFranchise.minPlayers - selectedFranchise.players.length))
        ) {
      isDisabled = true;
    }
    return isDisabled;
  }

  const franchiseBidSection = () => {
    return(
      <div className="franchise-bid-parent">
        {
          franchise.map((team) => {
            let isDisabled = isBidDisabled(team);
            return (
              <div className="franchise-bid-wrapper" style={{border: `1px solid ${team.color}`}}>
                {team.name}
                <button
                  disabled={isDisabled}
                  style={{
                    background: `linear-gradient(131.47deg, ${team.color}, 6.7%, ${team.color} 6.71%, ${team.colorGradientButton} 53.86%, ${team.color} 95.58%)`,
                    cursor: `${isDisabled ? "not-allowed" : "pointer"}`
                  }}
                  onClick={ () => makePlayerBid(team.id) }
                >
                  {isDisabled ? "X" : "+10"}
                </button>
              </div>
            )
          })
        }
      </div>
    ) 
  }

  const franchisePurseTable = () => {
    return (
      <table>
        <thead>
          <tr>
            <th colSpan="2">PURSE REMAINING</th>
          </tr>
        </thead>
        <tbody>
          {
            franchise.map((team) => { 
              return (
                <tr>
                  <td>{team.name}</td>
                  <td>{`${team.purseBalance} L`}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    )
  }

  const franchiseTable = () => {
    return (
      <div className="franchise-players-table">
        {franchise.map((team) =>{
          return (
            <table>
              <thead>
                <tr>
                  <th 
                    colSpan="3"
                    style={{
                      background: `linear-gradient(131.47deg, ${team.color}, 6.7%, ${team.color} 6.71%, ${team.colorGradientButton} 53.86%, ${team.color} 95.58%)`
                    }}
                  >
                    <div style={{display: "flex", justifyContent: "space-around"}}>
                      <span>{team.name}</span>
                      <span>{`${team.players.length} / ${team.maxPlayers}`}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {team.players.map((playerId) =>{
                  const player = players.find((player) => player.id === playerId);
                  return(
                    <tr>
                      <td>{player.name}</td>
                      <td>{player.stats.Position}</td>
                      <td>{player.stats.OVERALL}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        })}
        
      </div>
    )
  }


  const franchiseTableResults = () => {
    return (
      <div className="franchise-players-table">
        {franchise.map((team) =>{
          return (
            <table>
              <thead>
                <tr>
                  <th 
                    colSpan="5"
                    style={{
                      background: `linear-gradient(131.47deg, ${team.color}, 6.7%, ${team.color} 6.71%, ${team.colorGradientButton} 53.86%, ${team.color} 95.58%)`
                    }}
                  >
                    <div style={{display: "flex", justifyContent: "space-around"}}>
                      <span>{team.name}</span>
                    </div>
                  </th>
                </tr>
                <tr>
                  <th style={{
                      background: `linear-gradient(131.47deg, ${team.color}, 6.7%, ${team.color} 6.71%, ${team.colorGradientButton} 53.86%, ${team.color} 95.58%)`
                    }}>IMAGE</th>
                  <th style={{
                      background: `linear-gradient(131.47deg, ${team.color}, 6.7%, ${team.color} 6.71%, ${team.colorGradientButton} 53.86%, ${team.color} 95.58%)`
                    }}>NAME</th>
                  <th style={{
                      background: `linear-gradient(131.47deg, ${team.color}, 6.7%, ${team.color} 6.71%, ${team.colorGradientButton} 53.86%, ${team.color} 95.58%)`
                    }}>POSITION</th>
                  <th style={{
                      background: `linear-gradient(131.47deg, ${team.color}, 6.7%, ${team.color} 6.71%, ${team.colorGradientButton} 53.86%, ${team.color} 95.58%)`
                    }}>RATING</th>
                  <th style={{
                      background: `linear-gradient(131.47deg, ${team.color}, 6.7%, ${team.color} 6.71%, ${team.colorGradientButton} 53.86%, ${team.color} 95.58%)`
                    }}>PRICE</th>
                </tr>
              </thead>
              <tbody>
                {team.players.map((playerId) =>{
                  const player = players.find((player) => player.id === playerId);
                  return(
                    <tr>
                      <td>
                        <img                            
                            width={70}
                            height={70}
                            src={`./img/${player.name}.png`}
                            alt=""
                            onError={(e) => {
                              e.target.src = "./img/default.png";
                            }}
                          />
                      </td>
                      <td>
                        {player.name}
                      </td>
                      <td>{player.stats.Position}</td>
                      <td>{player.stats.OVERALL}</td>
                      <td>{player.sellPrice === 0 ? "-" : player.sellPrice+" L"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        })}
        
      </div>
    )
  }

  const highestBidSection = () => {
    let sortedPlayers = players;
    sortedPlayers.sort((a,b) => b.sellPrice-a.sellPrice);
    return(
      <div style={{marginTop: "20px"}}>
        <table>
          <thead>
            <tr>
              <th >
                Highest Bid
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.slice(0,3).map((player,index) => {
              return(
                <tr>
                  <td style={{position: "relative"}}>
                    <img                            
                        width={100}
                        height={100}
                        src={`./img/${player.name}.png`}
                        alt=""
                        onError={(e) => {
                          e.target.src = "./img/default.png";
                        }}
                      />
                    <div style={{
                      position: "absolute",
                      fontSize:"20px",
                      backgroundColor: getFranchiseColor(player.franchiseId),
                      height:"30px",
                      width:"30px",
                      top: 10
                      }}>
                      {index+1}
                    </div>
                    <div style={{fontSize:"20px"}}>
                      {player.name}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-text">MEGA AUCTION 2024</div>
      </header>

      <div className="main-container">
        {
          !showResults && 
          <>
            <div className="left-panel">
              {playerTableEntry()}
            </div>
            <div className="right-panel">
              <div className="right-panel-section">
              {selectedPlayer && selectedPlayer.stats && auctionStatus === "ONGOING" &&
                  <div className="column-section-1">
                    <div className="player-card-background" style={{
                      background: `linear-gradient(115.53deg, #ffffff 20.88%, #ffffff 42.22%, ${selectedPlayer.franchiseId !== "" ? getFranchiseColor(selectedPlayer.franchiseId) : "#8743fd"} 85.4%)`,
                      border: `6px solid ${selectedPlayer.franchiseId !== "" ? getFranchiseColor(selectedPlayer.franchiseId) : "#8743fd"}`
                    }}>
                      <img 
                        height="200px" 
                        width="240px" 
                        className="player-sold-img"
                        style={{
                          opacity: `${selectedPlayer.status === "sold" ? 1: 0}`
                        }} 
                        src="./img/sold.png" 
                        alt="">
                      </img>
                      <img 
                        height="200px" 
                        width="240px" 
                        className="player-unsold-img"
                        style={{
                          opacity: `${selectedPlayer.status === "unsold" ? 1: 0}`
                        }}  
                        src="./img/unsold.png" 
                        alt="">
                      </img>
                      <div className="player-card-info">
                        <div className="player-card-rating" style={{
                          background: `linear-gradient(151.61deg, ${selectedPlayer.franchiseId !== "" ? getFranchiseColor(selectedPlayer.franchiseId) : "#8743fd"} 57.63%, rgba(239, 211, 248, 0) 82.46%)`
                        }}>
                          <div>{selectedPlayer.stats.OVERALL}</div>
                          <div>{selectedPlayer.stats.Position}</div>
                        </div>
                        <img 
                          src={`./img/${selectedPlayer.name}.png`}
                          alt=""
                          onError={(e) => {
                            e.target.src = "./img/default.png";
                          }}
                        />
                      </div>
                      <div className="player-card-name">{selectedPlayer.name}</div>
                      <div className="player-card-horizontal-line"/>
                      {selectedPlayerStats()}
                    </div>
                  </div>
                }
                <div className="column-section-2">
                  <div className="player-auction-details">
                    {selectedPlayer && selectedPlayer.stats && auctionStatus === "ONGOING" &&
                      <div className="player-auction-price" style={{ 
                        'background-color': `${selectedPlayer.franchiseId !== "" ? getFranchiseColor(selectedPlayer.franchiseId) : "#8743fd"}`
                      }}>
                        <div className="player-auction-price-data">
                          {`BASE PRICE - ${selectedPlayer.basePrice} L`}
                        </div>
                        <div className="player-auction-price-data">
                          {`CURRENT BID - ${selectedPlayer.sellPrice} L`}
                        </div>
                      </div>
                    }
                    <div className="player-auction-franchise-details">
                      {selectedPlayer && selectedPlayer.stats && auctionStatus === "ONGOING" &&
                        franchiseBidSection()
                      }
                      {franchisePurseTable()}
                    </div>
                  </div>
                </div>
                <div className="column-section-3">
                {selectedPlayer && selectedPlayer.stats && auctionStatus === "ONGOING" && bidStatus === "ONGOING" &&
                  <CircularProgress
                    className="player-auction-timer"
                    color={countdown > 10 ? "success": "danger"}
                    determinate value={(countdown/countDownTime) * 100}
                    variant="solid"
                    sx={{
                      "--CircularProgress-size": "180px",
                      "--CircularProgress-trackThickness": "20px",
                      "--CircularProgress-progressThickness": "20px"
                    }}
                  >
                    <style>{getZoomFrames()}</style>
                    <div className="player-auction-pending-time">{countdown}</div>
                  </CircularProgress>
                }
                {auctionStatus === "FINISHED" && 
                  <button className="auction-button" onClick={()=>setShowResults(true)}>
                    RESULTS
                  </button>
                }
                {((auctionStatus === "NOT STARTED" && bidStatus === "NOT STARTED") || (auctionStatus === "ONGOING" && bidStatus !== "ONGOING")) &&
                  <button 
                    className="auction-button"
                    onClick={startAuction}
                  >
                    {`${auctionStatus === "NOT STARTED" ? "START": "NEXT"}`}
                  </button>
                }
                </div>
              </div>
            {franchiseTable()}
            </div>
          </>
        }
        {
          showResults &&
          <>
            <div className="right-panel">
              {franchiseTableResults()}
            </div>
            <div className="right-panel">
              {franchisePurseTable()}
              {highestBidSection()}
            </div>
          </>
          
        }
        
      </div>
    </div>
  );
}

export default App;

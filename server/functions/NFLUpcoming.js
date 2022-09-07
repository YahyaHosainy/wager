import fetch from 'node-fetch'
import RAM from './RAM.js'

async function Upcoming () {

  // try to get season data from cache or empty
  var season
  try {
    season = await RAM.get('season')
    season = JSON.parse(season)
  } catch (error) {
    season
  }

  // try to get teams data from cache or empty it
  var teams 
  var teamsGotOn
  try {

    teams = await RAM.get('teams')
    teams = JSON.parse(teams)
    teamsGotOn = await RAM.get('teamsGotOn')
    teamsGotOn = new Date(teamsGotOn)
  
  } catch (e) {}

  if (
    teams === undefined ||
    teamsGotOn === undefined ||
    !(teamsGotOn instanceof Date) ||
    (teamsGotOn.getTime() + 86400000) < Date.now()
  ) {
    // fetch data from sportsdata.io
    teams = await fetch(`https://api.sportsdata.io/v3/nfl/scores/json/Teams?key=${process.env.SPORTDATA_KEY}`)
    
    console.log('Teams.status',teams.status)

    // throw error if unable to fetch
    if (
      teams.status > 299
    ) {
      throw new Error("Can't fetch data from api: "+teams.statusText);
    }
    
    // pars data to json format
    teams = await teams.json()

    // put in cache
    await RAM.put('teams',JSON.stringify(teams))

    // specify the time of get for update every 24 hours
    await RAM.put('teamsGotOn',new Date())
  }

  // check for if data exists in cache and it is up to date.
  if (
    
    season === undefined ||
    !Array.isArray(season) ||
    season.length == 0 ||
    ((new Date(season[season.length - 1].Date)).getTime() < Date.now())
  
  ) {

    // get new if the data was expired or don't exists (get the current season)
    var current_season  = await fetch(`https://api.sportsdata.io/v3/nfl/scores/json/CurrentSeason?key=${process.env.SPORTDATA_KEY}`)

    console.log('CurrentSeason.status',current_season.status)

    // throw err of unbale to fetch
    if (
      current_season.status > 299
    ) {
      throw new Error("Can't fetch data from api: "+current_season.statusText);
    }

    // pars data to json
    current_season = await current_season.json()

    // get the current week of season
    var current_week  = await fetch(`https://api.sportsdata.io/v3/nfl/scores/json/CurrentWeek?key=${process.env.SPORTDATA_KEY}`)
    
    console.log('CurrentWeek.status',current_week.status)

    if (
      current_week.status > 299
    ) {
      throw new Error("Can't fetch data from api: "+current_week.statusText);
    }
    
    current_week = await current_week.json()
    
    // fetch games schedules (Preseason)
    var season1  = await fetch(`https://api.sportsdata.io/v3/nfl/scores/json/Schedules/${current_season}PRE?key=${process.env.SPORTDATA_KEY}`)
    
    console.log('Preseason.status',season1.status)

    if (
      season1.status > 299
    ) {
      throw new Error("Can't fetch data from api: "+season1.statusText);
    }
    
    season1 = await season1.json()
    
    // fetch games schedule (main season)
    var seasonMain  = await fetch(`https://api.sportsdata.io/v3/nfl/scores/json/Schedules/${current_season}?key=${process.env.SPORTDATA_KEY}`)
    
    console.log('MainSeason.status',seasonMain.status)

    if (
      seasonMain.status > 299
    ) {
      throw new Error("Can't fetch data from api: "+seasonMain.statusText);
    }

    seasonMain = await seasonMain.json()
    
    // concant the main season with preseason
    season1 = season1.concat(seasonMain)

    // check for cache which is exists or not
    if (
      season !== undefined &&
      Array.isArray(season) &&
      season.length > 0
    ) {
      // player props of played teams shuld be new
      season.forEach(async (match1) => {

        let include = true
        
        season1.every(async (match2) => {
          if (match2.Date === null) {
            return true
          }
          if (match1.GlobalGameId === match2.GlobalGameId) {
            include = false
          }
        });
        
        if (include) {
          console.log(`Player details of team ${match1.HomeTeam.Key} shulde new!`);
          console.log(`Player details of team ${match1.AwayTeam.Key} shulde new!`);
          await RAM.put('NFLPlayerDetailsUpdate'+match1.HomeTeam.Key,match1.Date)
          await RAM.put('NFLPlayerDetailsUpdate'+match1.AwayTeam.Key,match1.Date)
        }
      
      });
    } else {
      // if cache dosent exists then all player props shulde be new
      console.log("All player detials of all teams shulde new!");
      
      season1.every(async (match) => {
        if (match.Date !== null) {
          await RAM.put('NFLPlayerDetailsUpdate'+match.HomeTeam.Key,match.Date)
          await RAM.put('NFLPlayerDetailsUpdate'+match.AwayTeam.Key,match.Date)
        } else {
          return true;
        }
      });
    
    }
    
    // season variable is main varibale to use for data so put new data on to it
    season = season1

    // cache the result
    await RAM.put('season',JSON.stringify(season))
  
  }

  // return season

  // fillter returned data to upcoming today and tomorrow
  let upcoming  = []

  var tenDayLater  = new Date()
  tenDayLater.setDate(tenDayLater.getDate() + 10)
  tenDayLater.setHours(0,0,0,0)
  tenDayLater = tenDayLater.getTime()

  for (let i = 0; i < season.length; i++) {
    
    const match = season[i];
    
    let fixDate = new Date(match.Date)
    match.Date = fixDate
    let time = fixDate.getTime()

    // if < new then its in inplay so dont show it
    if (time < Date.now()) {

      // free the RAM
      delete season[i]
    
    } else if (time < tenDayLater) {

      // now put team info in the match data
      teams.forEach(team => {

        if (team.Key === match.AwayTeam) {
          match.AwayTeam = team
        }
        
        if (team.Key === match.HomeTeam) {
          match.HomeTeam = team
        }
      
      });
      
      upcoming.push(match)
    } else {
      // if time shuld not < tow days later then break
      break;
    }
  }

  return upcoming
}

export default async () => {

  // main export funtion to cache end result
  var upcoming
  
  // try to get from cache
  try {
    upcoming = await RAM.get('NFLUpcoming')
    upcoming = JSON.parse(upcoming)
  } catch (e) {}
  
  // if not in cache or its expired
  if (
    upcoming === undefined ||
    !Array.isArray(upcoming) ||
    upcoming.length === 0 ||
    ((new Date(upcoming[0].Date)).getTime() < Date.now())
  ) {
    // get new data
    upcoming = await Upcoming()
    // cache the data for another time
    await RAM.put('NFLUpcoming',JSON.stringify(upcoming))
    // alert
    console.log('NFLUpcoming data get new!');
  }

  return upcoming
}

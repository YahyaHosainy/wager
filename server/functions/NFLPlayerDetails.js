import fetch from 'node-fetch';
import RAM from './RAM.js'

export default async (Key,Number=0) => {

  // init vars
  var get
  var NFLPlayerDetailsUpdate
  
  // try to get player details from cache
  try {

    get = await RAM.get('player_details_of_'+Key)
    get = JSON.parse(get)
    
    NFLPlayerDetailsUpdate = await RAM.get('NFLPlayerDetailsUpdate'+Key)
    NFLPlayerDetailsUpdate = new Date(NFLPlayerDetailsUpdate)
    NFLPlayerDetailsUpdate.setHours(NFLPlayerDetailsUpdate.getHours() + 2)
    
  } catch (e) {}

  // get new data if cache doesint exists or team has a new played game
  if (
    !get ||
    NFLPlayerDetailsUpdate.getTime() < Date.now()
  ) {
    // get data
    get = await fetch(`https://api.sportsdata.io/v3/nfl/scores/json/Players/${Key}?key=${process.env.SPORTDATA_KEY}`)
    
    if (
      get.status !== 200
    ) {
      throw new Error("Can't fetch data from api: "+get.statusText);
    }
    
    get = await get.json()
    
    // cache
    await RAM.put('player_details_of_'+Key, JSON.stringify(get))
    await RAM.put('NFLPlayerDetailsUpdate'+Key,0)
    console.log("NFLPlayerDetailsUpdate"+Key+' = 0');

  }

  // return required counts
  if (Number !== 0) {
    
    let retArr = []
    
    for (let i = 0; i < Number; i++) {
      retArr.push(get[i])
    }
    
    return retArr
  
  }
  
  return get
}
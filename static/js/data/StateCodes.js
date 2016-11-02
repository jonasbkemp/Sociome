exports.states = { Alabama: 'AL',
  Alaska: 'AK',
  'American Samoa': 'AS',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  'District of Columbia': 'DC',
  'Federated States of Micronesia': 'FM',
  Florida: 'FL',
  Georgia: 'GA',
  Guam: 'GU',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  'Marshall Islands': 'MH',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Northern Mariana Islands': 'MP',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Palau: 'PW',
  Pennsylvania: 'PA',
  'Puerto Rico': 'PR',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  'Virgin Islands': 'VI',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY' }

var stateCodes = [
  {
    "abbreviation": "US",
    "state": "United States"
  },
  {
    "abbreviation": "AL",
    "state": "Alabama"
  },
  {
    "abbreviation": "AK",
    "state": "Alaska"
  },
  3,
  {
    "abbreviation": "AZ",
    "state": "Arizona"
  },
  {
    "abbreviation": "AR",
    "state": "Arkansas"
  },
  {
    "abbreviation": "CA",
    "state": "California"
  },
  7,
  {
    "abbreviation": "CO",
    "state": "Colorado"
  },
  {
    "abbreviation": "CT",
    "state": "Connecticut"
  },
  {
    "abbreviation": "DE",
    "state": "Delaware"
  },
  {
    "abbreviation": "DC",
    "state": "District of Columbia"
  },
  {
    "abbreviation": "FL",
    "state": "Florida"
  },
  {
    "abbreviation": "GA",
    "state": "Georgia"
  },
  14,
  {
    "abbreviation": "HI",
    "state": "Hawaii"
  },
  {
    "abbreviation": "ID",
    "state": "Idaho"
  },
  {
    "abbreviation": "IL",
    "state": "Illinois"
  },
  {
    "abbreviation": "IN",
    "state": "Indiana"
  },
  {
    "abbreviation": "IA",
    "state": "Iowa"
  },
  {
    "abbreviation": "KS",
    "state": "Kansas"
  },
  {
    "abbreviation": "KY",
    "state": "Kentucky"
  },
  {
    "abbreviation": "LA",
    "state": "Louisiana"
  },
  {
    "abbreviation": "ME",
    "state": "Maine"
  },
  {
    "abbreviation": "MD",
    "state": "Maryland"
  },
  {
    "abbreviation": "MA",
    "state": "Massachusetts"
  },
  {
    "abbreviation": "MI",
    "state": "Michigan"
  },
  {
    "abbreviation": "MN",
    "state": "Minnesota"
  },
  {
    "abbreviation": "MS",
    "state": "Mississippi"
  },
  {
    "abbreviation": "MO",
    "state": "Missouri"
  },
  {
    "abbreviation": "MT",
    "state": "Montana"
  },
  {
    "abbreviation": "NE",
    "state": "Nebraska"
  },
  {
    "abbreviation": "NV",
    "state": "Nevada"
  },
  {
    "abbreviation": "NH",
    "state": "New Hampshire"
  },
  {
    "abbreviation": "NJ",
    "state": "New Jersey"
  },
  {
    "abbreviation": "NM",
    "state": "New Mexico"
  },
  {
    "abbreviation": "NY",
    "state": "New York"
  },
  {
    "abbreviation": "NC",
    "state": "North Carolina"
  },
  {
    "abbreviation": "ND",
    "state": "North Dakota"
  },
  {
    "abbreviation": "OH",
    "state": "Ohio"
  },
  {
    "abbreviation": "OK",
    "state": "Oklahoma"
  },
  {
    "abbreviation": "OR",
    "state": "Oregon"
  },
  {
    "abbreviation": "PA",
    "state": "Pennsylvania"
  },
  43,
  {
    "abbreviation": "RI",
    "state": "Rhode Island"
  },
  {
    "abbreviation": "SC",
    "state": "South Carolina"
  },
  {
    "abbreviation": "SD",
    "state": "South Dakota"
  },
  {
    "abbreviation": "TN",
    "state": "Tennessee"
  },
  {
    "abbreviation": "TX",
    "state": "Texas"
  },
  {
    "abbreviation": "UT",
    "state": "Utah"
  },
  {
    "abbreviation": "VT",
    "state": "Vermont"
  },
  {
    "abbreviation": "VA",
    "state": "Virginia"
  },
  52,
  {
    "abbreviation": "WA",
    "state": "Washington"
  },
  {
    "abbreviation": "WV",
    "state": "West Virginia"
  },
  {
    "abbreviation": "WI",
    "state": "Wisconsin"
  },
  {
    "abbreviation": "WY",
    "state": "Wyoming"
  }
]

exports.getStateInfo = function(arg){
    if(typeof arg === 'number'){
        return stateCodes[arg];
    }else if(typeof arg === 'string'){
        return states[arg]
    }
}

exports.getCounty = function(stateID, countyID){
  return stateCodes[stateID].counties[countyID];
}

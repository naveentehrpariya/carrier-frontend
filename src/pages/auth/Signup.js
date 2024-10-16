import React, { useContext, useState } from "react";
import Button from "../common/Button";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout";
import Endpoints from "../../api/Endpoints";
import { UserContext } from "../../context/AuthProvider";
import toast from "react-hot-toast";
import Select from 'react-select'

const countries = [
  {
      "countryCode": "AD",
      "label": "Andorra",
      "currencyCode": "EUR",
      "population": "84000",
      "capital": "Andorra la Vella",
      "continentName": "Europe"
  },
  {
      "countryCode": "AE",
      "label": "United Arab Emirates",
      "currencyCode": "AED",
      "population": "4975593",
      "capital": "Abu Dhabi",
      "continentName": "Asia"
  },
  {
      "countryCode": "AF",
      "label": "Afghanistan",
      "currencyCode": "AFN",
      "population": "29121286",
      "capital": "Kabul",
      "continentName": "Asia"
  },
  {
      "countryCode": "AG",
      "label": "Antigua and Barbuda",
      "currencyCode": "XCD",
      "population": "86754",
      "capital": "St. John's",
      "continentName": "North America"
  },
  {
      "countryCode": "AI",
      "label": "Anguilla",
      "currencyCode": "XCD",
      "population": "13254",
      "capital": "The Valley",
      "continentName": "North America"
  },
  {
      "countryCode": "AL",
      "label": "Albania",
      "currencyCode": "ALL",
      "population": "2986952",
      "capital": "Tirana",
      "continentName": "Europe"
  },
  {
      "countryCode": "AM",
      "label": "Armenia",
      "currencyCode": "AMD",
      "population": "2968000",
      "capital": "Yerevan",
      "continentName": "Asia"
  },
  {
      "countryCode": "AO",
      "label": "Angola",
      "currencyCode": "AOA",
      "population": "13068161",
      "capital": "Luanda",
      "continentName": "Africa"
  },
  {
      "countryCode": "AQ",
      "label": "Antarctica",
      "currencyCode": "",
      "population": "0",
      "capital": "",
      "continentName": "Antarctica"
  },
  {
      "countryCode": "AR",
      "label": "Argentina",
      "currencyCode": "ARS",
      "population": "41343201",
      "capital": "Buenos Aires",
      "continentName": "South America"
  },
  {
      "countryCode": "AS",
      "label": "American Samoa",
      "currencyCode": "USD",
      "population": "57881",
      "capital": "Pago Pago",
      "continentName": "Oceania"
  },
  {
      "countryCode": "AT",
      "label": "Austria",
      "currencyCode": "EUR",
      "population": "8205000",
      "capital": "Vienna",
      "continentName": "Europe"
  },
  {
      "countryCode": "AU",
      "label": "Australia",
      "currencyCode": "AUD",
      "population": "21515754",
      "capital": "Canberra",
      "continentName": "Oceania"
  },
  {
      "countryCode": "AW",
      "label": "Aruba",
      "currencyCode": "AWG",
      "population": "71566",
      "capital": "Oranjestad",
      "continentName": "North America"
  },
  {
      "countryCode": "AX",
      "label": "Åland",
      "currencyCode": "EUR",
      "population": "26711",
      "capital": "Mariehamn",
      "continentName": "Europe"
  },
  {
      "countryCode": "AZ",
      "label": "Azerbaijan",
      "currencyCode": "AZN",
      "population": "8303512",
      "capital": "Baku",
      "continentName": "Asia"
  },
  {
      "countryCode": "BA",
      "label": "Bosnia and Herzegovina",
      "currencyCode": "BAM",
      "population": "4590000",
      "capital": "Sarajevo",
      "continentName": "Europe"
  },
  {
      "countryCode": "BB",
      "label": "Barbados",
      "currencyCode": "BBD",
      "population": "285653",
      "capital": "Bridgetown",
      "continentName": "North America"
  },
  {
      "countryCode": "BD",
      "label": "Bangladesh",
      "currencyCode": "BDT",
      "population": "156118464",
      "capital": "Dhaka",
      "continentName": "Asia"
  },
  {
      "countryCode": "BE",
      "label": "Belgium",
      "currencyCode": "EUR",
      "population": "10403000",
      "capital": "Brussels",
      "continentName": "Europe"
  },
  {
      "countryCode": "BF",
      "label": "Burkina Faso",
      "currencyCode": "XOF",
      "population": "16241811",
      "capital": "Ouagadougou",
      "continentName": "Africa"
  },
  {
      "countryCode": "BG",
      "label": "Bulgaria",
      "currencyCode": "BGN",
      "population": "7148785",
      "capital": "Sofia",
      "continentName": "Europe"
  },
  {
      "countryCode": "BH",
      "label": "Bahrain",
      "currencyCode": "BHD",
      "population": "738004",
      "capital": "Manama",
      "continentName": "Asia"
  },
  {
      "countryCode": "BI",
      "label": "Burundi",
      "currencyCode": "BIF",
      "population": "9863117",
      "capital": "Bujumbura",
      "continentName": "Africa"
  },
  {
      "countryCode": "BJ",
      "label": "Benin",
      "currencyCode": "XOF",
      "population": "9056010",
      "capital": "Porto-Novo",
      "continentName": "Africa"
  },
  {
      "countryCode": "BL",
      "label": "Saint Barthélemy",
      "currencyCode": "EUR",
      "population": "8450",
      "capital": "Gustavia",
      "continentName": "North America"
  },
  {
      "countryCode": "BM",
      "label": "Bermuda",
      "currencyCode": "BMD",
      "population": "65365",
      "capital": "Hamilton",
      "continentName": "North America"
  },
  {
      "countryCode": "BN",
      "label": "Brunei",
      "currencyCode": "BND",
      "population": "395027",
      "capital": "Bandar Seri Begawan",
      "continentName": "Asia"
  },
  {
      "countryCode": "BO",
      "label": "Bolivia",
      "currencyCode": "BOB",
      "population": "9947418",
      "capital": "Sucre",
      "continentName": "South America"
  },
  {
      "countryCode": "BQ",
      "label": "Bonaire",
      "currencyCode": "USD",
      "population": "18012",
      "capital": "Kralendijk",
      "continentName": "North America"
  },
  {
      "countryCode": "BR",
      "label": "Brazil",
      "currencyCode": "BRL",
      "population": "201103330",
      "capital": "Brasília",
      "continentName": "South America"
  },
  {
      "countryCode": "BS",
      "label": "Bahamas",
      "currencyCode": "BSD",
      "population": "301790",
      "capital": "Nassau",
      "continentName": "North America"
  },
  {
      "countryCode": "BT",
      "label": "Bhutan",
      "currencyCode": "BTN",
      "population": "699847",
      "capital": "Thimphu",
      "continentName": "Asia"
  },
  {
      "countryCode": "BV",
      "label": "Bouvet Island",
      "currencyCode": "NOK",
      "population": "0",
      "capital": "",
      "continentName": "Antarctica"
  },
  {
      "countryCode": "BW",
      "label": "Botswana",
      "currencyCode": "BWP",
      "population": "2029307",
      "capital": "Gaborone",
      "continentName": "Africa"
  },
  {
      "countryCode": "BY",
      "label": "Belarus",
      "currencyCode": "BYR",
      "population": "9685000",
      "capital": "Minsk",
      "continentName": "Europe"
  },
  {
      "countryCode": "BZ",
      "label": "Belize",
      "currencyCode": "BZD",
      "population": "314522",
      "capital": "Belmopan",
      "continentName": "North America"
  },
  {
      "countryCode": "CA",
      "label": "Canada",
      "currencyCode": "CAD",
      "population": "33679000",
      "capital": "Ottawa",
      "continentName": "North America"
  },
  {
      "countryCode": "CC",
      "label": "Cocos [Keeling] Islands",
      "currencyCode": "AUD",
      "population": "628",
      "capital": "West Island",
      "continentName": "Asia"
  },
  {
      "countryCode": "CD",
      "label": "Democratic Republic of the Congo",
      "currencyCode": "CDF",
      "population": "70916439",
      "capital": "Kinshasa",
      "continentName": "Africa"
  },
  {
      "countryCode": "CF",
      "label": "Central African Republic",
      "currencyCode": "XAF",
      "population": "4844927",
      "capital": "Bangui",
      "continentName": "Africa"
  },
  {
      "countryCode": "CG",
      "label": "Republic of the Congo",
      "currencyCode": "XAF",
      "population": "3039126",
      "capital": "Brazzaville",
      "continentName": "Africa"
  },
  {
      "countryCode": "CH",
      "label": "Switzerland",
      "currencyCode": "CHF",
      "population": "7581000",
      "capital": "Bern",
      "continentName": "Europe"
  },
  {
      "countryCode": "CI",
      "label": "Ivory Coast",
      "currencyCode": "XOF",
      "population": "21058798",
      "capital": "Yamoussoukro",
      "continentName": "Africa"
  },
  {
      "countryCode": "CK",
      "label": "Cook Islands",
      "currencyCode": "NZD",
      "population": "21388",
      "capital": "Avarua",
      "continentName": "Oceania"
  },
  {
      "countryCode": "CL",
      "label": "Chile",
      "currencyCode": "CLP",
      "population": "16746491",
      "capital": "Santiago",
      "continentName": "South America"
  },
  {
      "countryCode": "CM",
      "label": "Cameroon",
      "currencyCode": "XAF",
      "population": "19294149",
      "capital": "Yaoundé",
      "continentName": "Africa"
  },
  {
      "countryCode": "CN",
      "label": "China",
      "currencyCode": "CNY",
      "population": "1330044000",
      "capital": "Beijing",
      "continentName": "Asia"
  },
  {
      "countryCode": "CO",
      "label": "Colombia",
      "currencyCode": "COP",
      "population": "47790000",
      "capital": "Bogotá",
      "continentName": "South America"
  },
  {
      "countryCode": "CR",
      "label": "Costa Rica",
      "currencyCode": "CRC",
      "population": "4516220",
      "capital": "San José",
      "continentName": "North America"
  },
  {
      "countryCode": "CU",
      "label": "Cuba",
      "currencyCode": "CUP",
      "population": "11423000",
      "capital": "Havana",
      "continentName": "North America"
  },
  {
      "countryCode": "CV",
      "label": "Cape Verde",
      "currencyCode": "CVE",
      "population": "508659",
      "capital": "Praia",
      "continentName": "Africa"
  },
  {
      "countryCode": "CW",
      "label": "Curacao",
      "currencyCode": "ANG",
      "population": "141766",
      "capital": "Willemstad",
      "continentName": "North America"
  },
  {
      "countryCode": "CX",
      "label": "Christmas Island",
      "currencyCode": "AUD",
      "population": "1500",
      "capital": "Flying Fish Cove",
      "continentName": "Asia"
  },
  {
      "countryCode": "CY",
      "label": "Cyprus",
      "currencyCode": "EUR",
      "population": "1102677",
      "capital": "Nicosia",
      "continentName": "Europe"
  },
  {
      "countryCode": "CZ",
      "label": "Czechia",
      "currencyCode": "CZK",
      "population": "10476000",
      "capital": "Prague",
      "continentName": "Europe"
  },
  {
      "countryCode": "DE",
      "label": "Germany",
      "currencyCode": "EUR",
      "population": "81802257",
      "capital": "Berlin",
      "continentName": "Europe"
  },
  {
      "countryCode": "DJ",
      "label": "Djibouti",
      "currencyCode": "DJF",
      "population": "740528",
      "capital": "Djibouti",
      "continentName": "Africa"
  },
  {
      "countryCode": "DK",
      "label": "Denmark",
      "currencyCode": "DKK",
      "population": "5484000",
      "capital": "Copenhagen",
      "continentName": "Europe"
  },
  {
      "countryCode": "DM",
      "label": "Dominica",
      "currencyCode": "XCD",
      "population": "72813",
      "capital": "Roseau",
      "continentName": "North America"
  },
  {
      "countryCode": "DO",
      "label": "Dominican Republic",
      "currencyCode": "DOP",
      "population": "9823821",
      "capital": "Santo Domingo",
      "continentName": "North America"
  },
  {
      "countryCode": "DZ",
      "label": "Algeria",
      "currencyCode": "DZD",
      "population": "34586184",
      "capital": "Algiers",
      "continentName": "Africa"
  },
  {
      "countryCode": "EC",
      "label": "Ecuador",
      "currencyCode": "USD",
      "population": "14790608",
      "capital": "Quito",
      "continentName": "South America"
  },
  {
      "countryCode": "EE",
      "label": "Estonia",
      "currencyCode": "EUR",
      "population": "1291170",
      "capital": "Tallinn",
      "continentName": "Europe"
  },
  {
      "countryCode": "EG",
      "label": "Egypt",
      "currencyCode": "EGP",
      "population": "80471869",
      "capital": "Cairo",
      "continentName": "Africa"
  },
  {
      "countryCode": "EH",
      "label": "Western Sahara",
      "currencyCode": "MAD",
      "population": "273008",
      "capital": "Laâyoune / El Aaiún",
      "continentName": "Africa"
  },
  {
      "countryCode": "ER",
      "label": "Eritrea",
      "currencyCode": "ERN",
      "population": "5792984",
      "capital": "Asmara",
      "continentName": "Africa"
  },
  {
      "countryCode": "ES",
      "label": "Spain",
      "currencyCode": "EUR",
      "population": "46505963",
      "capital": "Madrid",
      "continentName": "Europe"
  },
  {
      "countryCode": "ET",
      "label": "Ethiopia",
      "currencyCode": "ETB",
      "population": "88013491",
      "capital": "Addis Ababa",
      "continentName": "Africa"
  },
  {
      "countryCode": "FI",
      "label": "Finland",
      "currencyCode": "EUR",
      "population": "5244000",
      "capital": "Helsinki",
      "continentName": "Europe"
  },
  {
      "countryCode": "FJ",
      "label": "Fiji",
      "currencyCode": "FJD",
      "population": "875983",
      "capital": "Suva",
      "continentName": "Oceania"
  },
  {
      "countryCode": "FK",
      "label": "Falkland Islands",
      "currencyCode": "FKP",
      "population": "2638",
      "capital": "Stanley",
      "continentName": "South America"
  },
  {
      "countryCode": "FM",
      "label": "Micronesia",
      "currencyCode": "USD",
      "population": "107708",
      "capital": "Palikir",
      "continentName": "Oceania"
  },
  {
      "countryCode": "FO",
      "label": "Faroe Islands",
      "currencyCode": "DKK",
      "population": "48228",
      "capital": "Tórshavn",
      "continentName": "Europe"
  },
  {
      "countryCode": "FR",
      "label": "France",
      "currencyCode": "EUR",
      "population": "64768389",
      "capital": "Paris",
      "continentName": "Europe"
  },
  {
      "countryCode": "GA",
      "label": "Gabon",
      "currencyCode": "XAF",
      "population": "1545255",
      "capital": "Libreville",
      "continentName": "Africa"
  },
  {
      "countryCode": "GB",
      "label": "United Kingdom",
      "currencyCode": "GBP",
      "population": "62348447",
      "capital": "London",
      "continentName": "Europe"
  },
  {
      "countryCode": "GD",
      "label": "Grenada",
      "currencyCode": "XCD",
      "population": "107818",
      "capital": "St. George's",
      "continentName": "North America"
  },
  {
      "countryCode": "GE",
      "label": "Georgia",
      "currencyCode": "GEL",
      "population": "4630000",
      "capital": "Tbilisi",
      "continentName": "Asia"
  },
  {
      "countryCode": "GF",
      "label": "French Guiana",
      "currencyCode": "EUR",
      "population": "195506",
      "capital": "Cayenne",
      "continentName": "South America"
  },
  {
      "countryCode": "GG",
      "label": "Guernsey",
      "currencyCode": "GBP",
      "population": "65228",
      "capital": "St Peter Port",
      "continentName": "Europe"
  },
  {
      "countryCode": "GH",
      "label": "Ghana",
      "currencyCode": "GHS",
      "population": "24339838",
      "capital": "Accra",
      "continentName": "Africa"
  },
  {
      "countryCode": "GI",
      "label": "Gibraltar",
      "currencyCode": "GIP",
      "population": "27884",
      "capital": "Gibraltar",
      "continentName": "Europe"
  },
  {
      "countryCode": "GL",
      "label": "Greenland",
      "currencyCode": "DKK",
      "population": "56375",
      "capital": "Nuuk",
      "continentName": "North America"
  },
  {
      "countryCode": "GM",
      "label": "Gambia",
      "currencyCode": "GMD",
      "population": "1593256",
      "capital": "Bathurst",
      "continentName": "Africa"
  },
  {
      "countryCode": "GN",
      "label": "Guinea",
      "currencyCode": "GNF",
      "population": "10324025",
      "capital": "Conakry",
      "continentName": "Africa"
  },
  {
      "countryCode": "GP",
      "label": "Guadeloupe",
      "currencyCode": "EUR",
      "population": "443000",
      "capital": "Basse-Terre",
      "continentName": "North America"
  },
  {
      "countryCode": "GQ",
      "label": "Equatorial Guinea",
      "currencyCode": "XAF",
      "population": "1014999",
      "capital": "Malabo",
      "continentName": "Africa"
  },
  {
      "countryCode": "GR",
      "label": "Greece",
      "currencyCode": "EUR",
      "population": "11000000",
      "capital": "Athens",
      "continentName": "Europe"
  },
  {
      "countryCode": "GS",
      "label": "South Georgia and the South Sandwich Islands",
      "currencyCode": "GBP",
      "population": "30",
      "capital": "Grytviken",
      "continentName": "Antarctica"
  },
  {
      "countryCode": "GT",
      "label": "Guatemala",
      "currencyCode": "GTQ",
      "population": "13550440",
      "capital": "Guatemala City",
      "continentName": "North America"
  },
  {
      "countryCode": "GU",
      "label": "Guam",
      "currencyCode": "USD",
      "population": "159358",
      "capital": "Hagåtña",
      "continentName": "Oceania"
  },
  {
      "countryCode": "GW",
      "label": "Guinea-Bissau",
      "currencyCode": "XOF",
      "population": "1565126",
      "capital": "Bissau",
      "continentName": "Africa"
  },
  {
      "countryCode": "GY",
      "label": "Guyana",
      "currencyCode": "GYD",
      "population": "748486",
      "capital": "Georgetown",
      "continentName": "South America"
  },
  {
      "countryCode": "HK",
      "label": "Hong Kong",
      "currencyCode": "HKD",
      "population": "6898686",
      "capital": "Hong Kong",
      "continentName": "Asia"
  },
  {
      "countryCode": "HM",
      "label": "Heard Island and McDonald Islands",
      "currencyCode": "AUD",
      "population": "0",
      "capital": "",
      "continentName": "Antarctica"
  },
  {
      "countryCode": "HN",
      "label": "Honduras",
      "currencyCode": "HNL",
      "population": "7989415",
      "capital": "Tegucigalpa",
      "continentName": "North America"
  },
  {
      "countryCode": "HR",
      "label": "Croatia",
      "currencyCode": "HRK",
      "population": "4284889",
      "capital": "Zagreb",
      "continentName": "Europe"
  },
  {
      "countryCode": "HT",
      "label": "Haiti",
      "currencyCode": "HTG",
      "population": "9648924",
      "capital": "Port-au-Prince",
      "continentName": "North America"
  },
  {
      "countryCode": "HU",
      "label": "Hungary",
      "currencyCode": "HUF",
      "population": "9982000",
      "capital": "Budapest",
      "continentName": "Europe"
  },
  {
      "countryCode": "ID",
      "label": "Indonesia",
      "currencyCode": "IDR",
      "population": "242968342",
      "capital": "Jakarta",
      "continentName": "Asia"
  },
  {
      "countryCode": "IE",
      "label": "Ireland",
      "currencyCode": "EUR",
      "population": "4622917",
      "capital": "Dublin",
      "continentName": "Europe"
  },
  {
      "countryCode": "IL",
      "label": "Israel",
      "currencyCode": "ILS",
      "population": "7353985",
      "capital": "",
      "continentName": "Asia"
  },
  {
      "countryCode": "IM",
      "label": "Isle of Man",
      "currencyCode": "GBP",
      "population": "75049",
      "capital": "Douglas",
      "continentName": "Europe"
  },
  {
      "countryCode": "IN",
      "label": "India",
      "currencyCode": "INR",
      "population": "1173108018",
      "capital": "New Delhi",
      "continentName": "Asia"
  },
  {
      "countryCode": "IO",
      "label": "British Indian Ocean Territory",
      "currencyCode": "USD",
      "population": "4000",
      "capital": "",
      "continentName": "Asia"
  },
  {
      "countryCode": "IQ",
      "label": "Iraq",
      "currencyCode": "IQD",
      "population": "29671605",
      "capital": "Baghdad",
      "continentName": "Asia"
  },
  {
      "countryCode": "IR",
      "label": "Iran",
      "currencyCode": "IRR",
      "population": "76923300",
      "capital": "Tehran",
      "continentName": "Asia"
  },
  {
      "countryCode": "IS",
      "label": "Iceland",
      "currencyCode": "ISK",
      "population": "308910",
      "capital": "Reykjavik",
      "continentName": "Europe"
  },
  {
      "countryCode": "IT",
      "label": "Italy",
      "currencyCode": "EUR",
      "population": "60340328",
      "capital": "Rome",
      "continentName": "Europe"
  },
  {
      "countryCode": "JE",
      "label": "Jersey",
      "currencyCode": "GBP",
      "population": "90812",
      "capital": "Saint Helier",
      "continentName": "Europe"
  },
  {
      "countryCode": "JM",
      "label": "Jamaica",
      "currencyCode": "JMD",
      "population": "2847232",
      "capital": "Kingston",
      "continentName": "North America"
  },
  {
      "countryCode": "JO",
      "label": "Jordan",
      "currencyCode": "JOD",
      "population": "6407085",
      "capital": "Amman",
      "continentName": "Asia"
  },
  {
      "countryCode": "JP",
      "label": "Japan",
      "currencyCode": "JPY",
      "population": "127288000",
      "capital": "Tokyo",
      "continentName": "Asia"
  },
  {
      "countryCode": "KE",
      "label": "Kenya",
      "currencyCode": "KES",
      "population": "40046566",
      "capital": "Nairobi",
      "continentName": "Africa"
  },
  {
      "countryCode": "KG",
      "label": "Kyrgyzstan",
      "currencyCode": "KGS",
      "population": "5776500",
      "capital": "Bishkek",
      "continentName": "Asia"
  },
  {
      "countryCode": "KH",
      "label": "Cambodia",
      "currencyCode": "KHR",
      "population": "14453680",
      "capital": "Phnom Penh",
      "continentName": "Asia"
  },
  {
      "countryCode": "KI",
      "label": "Kiribati",
      "currencyCode": "AUD",
      "population": "92533",
      "capital": "Tarawa",
      "continentName": "Oceania"
  },
  {
      "countryCode": "KM",
      "label": "Comoros",
      "currencyCode": "KMF",
      "population": "773407",
      "capital": "Moroni",
      "continentName": "Africa"
  },
  {
      "countryCode": "KN",
      "label": "Saint Kitts and Nevis",
      "currencyCode": "XCD",
      "population": "51134",
      "capital": "Basseterre",
      "continentName": "North America"
  },
  {
      "countryCode": "KP",
      "label": "North Korea",
      "currencyCode": "KPW",
      "population": "22912177",
      "capital": "Pyongyang",
      "continentName": "Asia"
  },
  {
      "countryCode": "KR",
      "label": "South Korea",
      "currencyCode": "KRW",
      "population": "48422644",
      "capital": "Seoul",
      "continentName": "Asia"
  },
  {
      "countryCode": "KW",
      "label": "Kuwait",
      "currencyCode": "KWD",
      "population": "2789132",
      "capital": "Kuwait City",
      "continentName": "Asia"
  },
  {
      "countryCode": "KY",
      "label": "Cayman Islands",
      "currencyCode": "KYD",
      "population": "44270",
      "capital": "George Town",
      "continentName": "North America"
  },
  {
      "countryCode": "KZ",
      "label": "Kazakhstan",
      "currencyCode": "KZT",
      "population": "15340000",
      "capital": "Astana",
      "continentName": "Asia"
  },
  {
      "countryCode": "LA",
      "label": "Laos",
      "currencyCode": "LAK",
      "population": "6368162",
      "capital": "Vientiane",
      "continentName": "Asia"
  },
  {
      "countryCode": "LB",
      "label": "Lebanon",
      "currencyCode": "LBP",
      "population": "4125247",
      "capital": "Beirut",
      "continentName": "Asia"
  },
  {
      "countryCode": "LC",
      "label": "Saint Lucia",
      "currencyCode": "XCD",
      "population": "160922",
      "capital": "Castries",
      "continentName": "North America"
  },
  {
      "countryCode": "LI",
      "label": "Liechtenstein",
      "currencyCode": "CHF",
      "population": "35000",
      "capital": "Vaduz",
      "continentName": "Europe"
  },
  {
      "countryCode": "LK",
      "label": "Sri Lanka",
      "currencyCode": "LKR",
      "population": "21513990",
      "capital": "Colombo",
      "continentName": "Asia"
  },
  {
      "countryCode": "LR",
      "label": "Liberia",
      "currencyCode": "LRD",
      "population": "3685076",
      "capital": "Monrovia",
      "continentName": "Africa"
  },
  {
      "countryCode": "LS",
      "label": "Lesotho",
      "currencyCode": "LSL",
      "population": "1919552",
      "capital": "Maseru",
      "continentName": "Africa"
  },
  {
      "countryCode": "LT",
      "label": "Lithuania",
      "currencyCode": "EUR",
      "population": "2944459",
      "capital": "Vilnius",
      "continentName": "Europe"
  },
  {
      "countryCode": "LU",
      "label": "Luxembourg",
      "currencyCode": "EUR",
      "population": "497538",
      "capital": "Luxembourg",
      "continentName": "Europe"
  },
  {
      "countryCode": "LV",
      "label": "Latvia",
      "currencyCode": "EUR",
      "population": "2217969",
      "capital": "Riga",
      "continentName": "Europe"
  },
  {
      "countryCode": "LY",
      "label": "Libya",
      "currencyCode": "LYD",
      "population": "6461454",
      "capital": "Tripoli",
      "continentName": "Africa"
  },
  {
      "countryCode": "MA",
      "label": "Morocco",
      "currencyCode": "MAD",
      "population": "33848242",
      "capital": "Rabat",
      "continentName": "Africa"
  },
  {
      "countryCode": "MC",
      "label": "Monaco",
      "currencyCode": "EUR",
      "population": "32965",
      "capital": "Monaco",
      "continentName": "Europe"
  },
  {
      "countryCode": "MD",
      "label": "Moldova",
      "currencyCode": "MDL",
      "population": "4324000",
      "capital": "Chişinău",
      "continentName": "Europe"
  },
  {
      "countryCode": "ME",
      "label": "Montenegro",
      "currencyCode": "EUR",
      "population": "666730",
      "capital": "Podgorica",
      "continentName": "Europe"
  },
  {
      "countryCode": "MF",
      "label": "Saint Martin",
      "currencyCode": "EUR",
      "population": "35925",
      "capital": "Marigot",
      "continentName": "North America"
  },
  {
      "countryCode": "MG",
      "label": "Madagascar",
      "currencyCode": "MGA",
      "population": "21281844",
      "capital": "Antananarivo",
      "continentName": "Africa"
  },
  {
      "countryCode": "MH",
      "label": "Marshall Islands",
      "currencyCode": "USD",
      "population": "65859",
      "capital": "Majuro",
      "continentName": "Oceania"
  },
  {
      "countryCode": "MK",
      "label": "Macedonia",
      "currencyCode": "MKD",
      "population": "2062294",
      "capital": "Skopje",
      "continentName": "Europe"
  },
  {
      "countryCode": "ML",
      "label": "Mali",
      "currencyCode": "XOF",
      "population": "13796354",
      "capital": "Bamako",
      "continentName": "Africa"
  },
  {
      "countryCode": "MM",
      "label": "Myanmar [Burma]",
      "currencyCode": "MMK",
      "population": "53414374",
      "capital": "Naypyitaw",
      "continentName": "Asia"
  },
  {
      "countryCode": "MN",
      "label": "Mongolia",
      "currencyCode": "MNT",
      "population": "3086918",
      "capital": "Ulan Bator",
      "continentName": "Asia"
  },
  {
      "countryCode": "MO",
      "label": "Macao",
      "currencyCode": "MOP",
      "population": "449198",
      "capital": "Macao",
      "continentName": "Asia"
  },
  {
      "countryCode": "MP",
      "label": "Northern Mariana Islands",
      "currencyCode": "USD",
      "population": "53883",
      "capital": "Saipan",
      "continentName": "Oceania"
  },
  {
      "countryCode": "MQ",
      "label": "Martinique",
      "currencyCode": "EUR",
      "population": "432900",
      "capital": "Fort-de-France",
      "continentName": "North America"
  },
  {
      "countryCode": "MR",
      "label": "Mauritania",
      "currencyCode": "MRO",
      "population": "3205060",
      "capital": "Nouakchott",
      "continentName": "Africa"
  },
  {
      "countryCode": "MS",
      "label": "Montserrat",
      "currencyCode": "XCD",
      "population": "9341",
      "capital": "Plymouth",
      "continentName": "North America"
  },
  {
      "countryCode": "MT",
      "label": "Malta",
      "currencyCode": "EUR",
      "population": "403000",
      "capital": "Valletta",
      "continentName": "Europe"
  },
  {
      "countryCode": "MU",
      "label": "Mauritius",
      "currencyCode": "MUR",
      "population": "1294104",
      "capital": "Port Louis",
      "continentName": "Africa"
  },
  {
      "countryCode": "MV",
      "label": "Maldives",
      "currencyCode": "MVR",
      "population": "395650",
      "capital": "Malé",
      "continentName": "Asia"
  },
  {
      "countryCode": "MW",
      "label": "Malawi",
      "currencyCode": "MWK",
      "population": "15447500",
      "capital": "Lilongwe",
      "continentName": "Africa"
  },
  {
      "countryCode": "MX",
      "label": "Mexico",
      "currencyCode": "MXN",
      "population": "112468855",
      "capital": "Mexico City",
      "continentName": "North America"
  },
  {
      "countryCode": "MY",
      "label": "Malaysia",
      "currencyCode": "MYR",
      "population": "28274729",
      "capital": "Kuala Lumpur",
      "continentName": "Asia"
  },
  {
      "countryCode": "MZ",
      "label": "Mozambique",
      "currencyCode": "MZN",
      "population": "22061451",
      "capital": "Maputo",
      "continentName": "Africa"
  },
  {
      "countryCode": "NA",
      "label": "Namibia",
      "currencyCode": "NAD",
      "population": "2128471",
      "capital": "Windhoek",
      "continentName": "Africa"
  },
  {
      "countryCode": "NC",
      "label": "New Caledonia",
      "currencyCode": "XPF",
      "population": "216494",
      "capital": "Noumea",
      "continentName": "Oceania"
  },
  {
      "countryCode": "NE",
      "label": "Niger",
      "currencyCode": "XOF",
      "population": "15878271",
      "capital": "Niamey",
      "continentName": "Africa"
  },
  {
      "countryCode": "NF",
      "label": "Norfolk Island",
      "currencyCode": "AUD",
      "population": "1828",
      "capital": "Kingston",
      "continentName": "Oceania"
  },
  {
      "countryCode": "NG",
      "label": "Nigeria",
      "currencyCode": "NGN",
      "population": "154000000",
      "capital": "Abuja",
      "continentName": "Africa"
  },
  {
      "countryCode": "NI",
      "label": "Nicaragua",
      "currencyCode": "NIO",
      "population": "5995928",
      "capital": "Managua",
      "continentName": "North America"
  },
  {
      "countryCode": "NL",
      "label": "Netherlands",
      "currencyCode": "EUR",
      "population": "16645000",
      "capital": "Amsterdam",
      "continentName": "Europe"
  },
  {
      "countryCode": "NO",
      "label": "Norway",
      "currencyCode": "NOK",
      "population": "5009150",
      "capital": "Oslo",
      "continentName": "Europe"
  },
  {
      "countryCode": "NP",
      "label": "Nepal",
      "currencyCode": "NPR",
      "population": "28951852",
      "capital": "Kathmandu",
      "continentName": "Asia"
  },
  {
      "countryCode": "NR",
      "label": "Nauru",
      "currencyCode": "AUD",
      "population": "10065",
      "capital": "Yaren",
      "continentName": "Oceania"
  },
  {
      "countryCode": "NU",
      "label": "Niue",
      "currencyCode": "NZD",
      "population": "2166",
      "capital": "Alofi",
      "continentName": "Oceania"
  },
  {
      "countryCode": "NZ",
      "label": "New Zealand",
      "currencyCode": "NZD",
      "population": "4252277",
      "capital": "Wellington",
      "continentName": "Oceania"
  },
  {
      "countryCode": "OM",
      "label": "Oman",
      "currencyCode": "OMR",
      "population": "2967717",
      "capital": "Muscat",
      "continentName": "Asia"
  },
  {
      "countryCode": "PA",
      "label": "Panama",
      "currencyCode": "PAB",
      "population": "3410676",
      "capital": "Panama City",
      "continentName": "North America"
  },
  {
      "countryCode": "PE",
      "label": "Peru",
      "currencyCode": "PEN",
      "population": "29907003",
      "capital": "Lima",
      "continentName": "South America"
  },
  {
      "countryCode": "PF",
      "label": "French Polynesia",
      "currencyCode": "XPF",
      "population": "270485",
      "capital": "Papeete",
      "continentName": "Oceania"
  },
  {
      "countryCode": "PG",
      "label": "Papua New Guinea",
      "currencyCode": "PGK",
      "population": "6064515",
      "capital": "Port Moresby",
      "continentName": "Oceania"
  },
  {
      "countryCode": "PH",
      "label": "Philippines",
      "currencyCode": "PHP",
      "population": "99900177",
      "capital": "Manila",
      "continentName": "Asia"
  },
  {
      "countryCode": "PK",
      "label": "Pakistan",
      "currencyCode": "PKR",
      "population": "184404791",
      "capital": "Islamabad",
      "continentName": "Asia"
  },
  {
      "countryCode": "PL",
      "label": "Poland",
      "currencyCode": "PLN",
      "population": "38500000",
      "capital": "Warsaw",
      "continentName": "Europe"
  },
  {
      "countryCode": "PM",
      "label": "Saint Pierre and Miquelon",
      "currencyCode": "EUR",
      "population": "7012",
      "capital": "Saint-Pierre",
      "continentName": "North America"
  },
  {
      "countryCode": "PN",
      "label": "Pitcairn Islands",
      "currencyCode": "NZD",
      "population": "46",
      "capital": "Adamstown",
      "continentName": "Oceania"
  },
  {
      "countryCode": "PR",
      "label": "Puerto Rico",
      "currencyCode": "USD",
      "population": "3916632",
      "capital": "San Juan",
      "continentName": "North America"
  },
  {
      "countryCode": "PS",
      "label": "Palestine",
      "currencyCode": "ILS",
      "population": "3800000",
      "capital": "",
      "continentName": "Asia"
  },
  {
      "countryCode": "PT",
      "label": "Portugal",
      "currencyCode": "EUR",
      "population": "10676000",
      "capital": "Lisbon",
      "continentName": "Europe"
  },
  {
      "countryCode": "PW",
      "label": "Palau",
      "currencyCode": "USD",
      "population": "19907",
      "capital": "Melekeok",
      "continentName": "Oceania"
  },
  {
      "countryCode": "PY",
      "label": "Paraguay",
      "currencyCode": "PYG",
      "population": "6375830",
      "capital": "Asunción",
      "continentName": "South America"
  },
  {
      "countryCode": "QA",
      "label": "Qatar",
      "currencyCode": "QAR",
      "population": "840926",
      "capital": "Doha",
      "continentName": "Asia"
  },
  {
      "countryCode": "RE",
      "label": "Réunion",
      "currencyCode": "EUR",
      "population": "776948",
      "capital": "Saint-Denis",
      "continentName": "Africa"
  },
  {
      "countryCode": "RO",
      "label": "Romania",
      "currencyCode": "RON",
      "population": "21959278",
      "capital": "Bucharest",
      "continentName": "Europe"
  },
  {
      "countryCode": "RS",
      "label": "Serbia",
      "currencyCode": "RSD",
      "population": "7344847",
      "capital": "Belgrade",
      "continentName": "Europe"
  },
  {
      "countryCode": "RU",
      "label": "Russia",
      "currencyCode": "RUB",
      "population": "140702000",
      "capital": "Moscow",
      "continentName": "Europe"
  },
  {
      "countryCode": "RW",
      "label": "Rwanda",
      "currencyCode": "RWF",
      "population": "11055976",
      "capital": "Kigali",
      "continentName": "Africa"
  },
  {
      "countryCode": "SA",
      "label": "Saudi Arabia",
      "currencyCode": "SAR",
      "population": "25731776",
      "capital": "Riyadh",
      "continentName": "Asia"
  },
  {
      "countryCode": "SB",
      "label": "Solomon Islands",
      "currencyCode": "SBD",
      "population": "559198",
      "capital": "Honiara",
      "continentName": "Oceania"
  },
  {
      "countryCode": "SC",
      "label": "Seychelles",
      "currencyCode": "SCR",
      "population": "88340",
      "capital": "Victoria",
      "continentName": "Africa"
  },
  {
      "countryCode": "SD",
      "label": "Sudan",
      "currencyCode": "SDG",
      "population": "35000000",
      "capital": "Khartoum",
      "continentName": "Africa"
  },
  {
      "countryCode": "SE",
      "label": "Sweden",
      "currencyCode": "SEK",
      "population": "9828655",
      "capital": "Stockholm",
      "continentName": "Europe"
  },
  {
      "countryCode": "SG",
      "label": "Singapore",
      "currencyCode": "SGD",
      "population": "4701069",
      "capital": "Singapore",
      "continentName": "Asia"
  },
  {
      "countryCode": "SH",
      "label": "Saint Helena",
      "currencyCode": "SHP",
      "population": "7460",
      "capital": "Jamestown",
      "continentName": "Africa"
  },
  {
      "countryCode": "SI",
      "label": "Slovenia",
      "currencyCode": "EUR",
      "population": "2007000",
      "capital": "Ljubljana",
      "continentName": "Europe"
  },
  {
      "countryCode": "SJ",
      "label": "Svalbard and Jan Mayen",
      "currencyCode": "NOK",
      "population": "2550",
      "capital": "Longyearbyen",
      "continentName": "Europe"
  },
  {
      "countryCode": "SK",
      "label": "Slovakia",
      "currencyCode": "EUR",
      "population": "5455000",
      "capital": "Bratislava",
      "continentName": "Europe"
  },
  {
      "countryCode": "SL",
      "label": "Sierra Leone",
      "currencyCode": "SLL",
      "population": "5245695",
      "capital": "Freetown",
      "continentName": "Africa"
  },
  {
      "countryCode": "SM",
      "label": "San Marino",
      "currencyCode": "EUR",
      "population": "31477",
      "capital": "San Marino",
      "continentName": "Europe"
  },
  {
      "countryCode": "SN",
      "label": "Senegal",
      "currencyCode": "XOF",
      "population": "12323252",
      "capital": "Dakar",
      "continentName": "Africa"
  },
  {
      "countryCode": "SO",
      "label": "Somalia",
      "currencyCode": "SOS",
      "population": "10112453",
      "capital": "Mogadishu",
      "continentName": "Africa"
  },
  {
      "countryCode": "SR",
      "label": "Suriname",
      "currencyCode": "SRD",
      "population": "492829",
      "capital": "Paramaribo",
      "continentName": "South America"
  },
  {
      "countryCode": "SS",
      "label": "South Sudan",
      "currencyCode": "SSP",
      "population": "8260490",
      "capital": "Juba",
      "continentName": "Africa"
  },
  {
      "countryCode": "ST",
      "label": "São Tomé and Príncipe",
      "currencyCode": "STD",
      "population": "175808",
      "capital": "São Tomé",
      "continentName": "Africa"
  },
  {
      "countryCode": "SV",
      "label": "El Salvador",
      "currencyCode": "USD",
      "population": "6052064",
      "capital": "San Salvador",
      "continentName": "North America"
  },
  {
      "countryCode": "SX",
      "label": "Sint Maarten",
      "currencyCode": "ANG",
      "population": "37429",
      "capital": "Philipsburg",
      "continentName": "North America"
  },
  {
      "countryCode": "SY",
      "label": "Syria",
      "currencyCode": "SYP",
      "population": "22198110",
      "capital": "Damascus",
      "continentName": "Asia"
  },
  {
      "countryCode": "SZ",
      "label": "Swaziland",
      "currencyCode": "SZL",
      "population": "1354051",
      "capital": "Mbabane",
      "continentName": "Africa"
  },
  {
      "countryCode": "TC",
      "label": "Turks and Caicos Islands",
      "currencyCode": "USD",
      "population": "20556",
      "capital": "Cockburn Town",
      "continentName": "North America"
  },
  {
      "countryCode": "TD",
      "label": "Chad",
      "currencyCode": "XAF",
      "population": "10543464",
      "capital": "N'Djamena",
      "continentName": "Africa"
  },
  {
      "countryCode": "TF",
      "label": "French Southern Territories",
      "currencyCode": "EUR",
      "population": "140",
      "capital": "Port-aux-Français",
      "continentName": "Antarctica"
  },
  {
      "countryCode": "TG",
      "label": "Togo",
      "currencyCode": "XOF",
      "population": "6587239",
      "capital": "Lomé",
      "continentName": "Africa"
  },
  {
      "countryCode": "TH",
      "label": "Thailand",
      "currencyCode": "THB",
      "population": "67089500",
      "capital": "Bangkok",
      "continentName": "Asia"
  },
  {
      "countryCode": "TJ",
      "label": "Tajikistan",
      "currencyCode": "TJS",
      "population": "7487489",
      "capital": "Dushanbe",
      "continentName": "Asia"
  },
  {
      "countryCode": "TK",
      "label": "Tokelau",
      "currencyCode": "NZD",
      "population": "1466",
      "capital": "",
      "continentName": "Oceania"
  },
  {
      "countryCode": "TL",
      "label": "East Timor",
      "currencyCode": "USD",
      "population": "1154625",
      "capital": "Dili",
      "continentName": "Oceania"
  },
  {
      "countryCode": "TM",
      "label": "Turkmenistan",
      "currencyCode": "TMT",
      "population": "4940916",
      "capital": "Ashgabat",
      "continentName": "Asia"
  },
  {
      "countryCode": "TN",
      "label": "Tunisia",
      "currencyCode": "TND",
      "population": "10589025",
      "capital": "Tunis",
      "continentName": "Africa"
  },
  {
      "countryCode": "TO",
      "label": "Tonga",
      "currencyCode": "TOP",
      "population": "122580",
      "capital": "Nuku'alofa",
      "continentName": "Oceania"
  },
  {
      "countryCode": "TR",
      "label": "Turkey",
      "currencyCode": "TRY",
      "population": "77804122",
      "capital": "Ankara",
      "continentName": "Asia"
  },
  {
      "countryCode": "TT",
      "label": "Trinidad and Tobago",
      "currencyCode": "TTD",
      "population": "1228691",
      "capital": "Port of Spain",
      "continentName": "North America"
  },
  {
      "countryCode": "TV",
      "label": "Tuvalu",
      "currencyCode": "AUD",
      "population": "10472",
      "capital": "Funafuti",
      "continentName": "Oceania"
  },
  {
      "countryCode": "TW",
      "label": "Taiwan",
      "currencyCode": "TWD",
      "population": "22894384",
      "capital": "Taipei",
      "continentName": "Asia"
  },
  {
      "countryCode": "TZ",
      "label": "Tanzania",
      "currencyCode": "TZS",
      "population": "41892895",
      "capital": "Dodoma",
      "continentName": "Africa"
  },
  {
      "countryCode": "UA",
      "label": "Ukraine",
      "currencyCode": "UAH",
      "population": "45415596",
      "capital": "Kiev",
      "continentName": "Europe"
  },
  {
      "countryCode": "UG",
      "label": "Uganda",
      "currencyCode": "UGX",
      "population": "33398682",
      "capital": "Kampala",
      "continentName": "Africa"
  },
  {
      "countryCode": "UM",
      "label": "U.S. Minor Outlying Islands",
      "currencyCode": "USD",
      "population": "0",
      "capital": "",
      "continentName": "Oceania"
  },
  {
      "countryCode": "US",
      "label": "United States",
      "currencyCode": "USD",
      "population": "310232863",
      "capital": "Washington",
      "continentName": "North America"
  },
  {
      "countryCode": "UY",
      "label": "Uruguay",
      "currencyCode": "UYU",
      "population": "3477000",
      "capital": "Montevideo",
      "continentName": "South America"
  },
  {
      "countryCode": "UZ",
      "label": "Uzbekistan",
      "currencyCode": "UZS",
      "population": "27865738",
      "capital": "Tashkent",
      "continentName": "Asia"
  },
  {
      "countryCode": "VA",
      "label": "Vatican City",
      "currencyCode": "EUR",
      "population": "921",
      "capital": "Vatican City",
      "continentName": "Europe"
  },
  {
      "countryCode": "VC",
      "label": "Saint Vincent and the Grenadines",
      "currencyCode": "XCD",
      "population": "104217",
      "capital": "Kingstown",
      "continentName": "North America"
  },
  {
      "countryCode": "VE",
      "label": "Venezuela",
      "currencyCode": "VEF",
      "population": "27223228",
      "capital": "Caracas",
      "continentName": "South America"
  },
  {
      "countryCode": "VG",
      "label": "British Virgin Islands",
      "currencyCode": "USD",
      "population": "21730",
      "capital": "Road Town",
      "continentName": "North America"
  },
  {
      "countryCode": "VI",
      "label": "U.S. Virgin Islands",
      "currencyCode": "USD",
      "population": "108708",
      "capital": "Charlotte Amalie",
      "continentName": "North America"
  },
  {
      "countryCode": "VN",
      "label": "Vietnam",
      "currencyCode": "VND",
      "population": "89571130",
      "capital": "Hanoi",
      "continentName": "Asia"
  },
  {
      "countryCode": "VU",
      "label": "Vanuatu",
      "currencyCode": "VUV",
      "population": "221552",
      "capital": "Port Vila",
      "continentName": "Oceania"
  },
  {
      "countryCode": "WF",
      "label": "Wallis and Futuna",
      "currencyCode": "XPF",
      "population": "16025",
      "capital": "Mata-Utu",
      "continentName": "Oceania"
  },
  {
      "countryCode": "WS",
      "label": "Samoa",
      "currencyCode": "WST",
      "population": "192001",
      "capital": "Apia",
      "continentName": "Oceania"
  },
  {
      "countryCode": "XK",
      "label": "Kosovo",
      "currencyCode": "EUR",
      "population": "1800000",
      "capital": "Pristina",
      "continentName": "Europe"
  },
  {
      "countryCode": "YE",
      "label": "Yemen",
      "currencyCode": "YER",
      "population": "23495361",
      "capital": "Sanaa",
      "continentName": "Asia"
  },
  {
      "countryCode": "YT",
      "label": "Mayotte",
      "currencyCode": "EUR",
      "population": "159042",
      "capital": "Mamoudzou",
      "continentName": "Africa"
  },
  {
      "countryCode": "ZA",
      "label": "South Africa",
      "currencyCode": "ZAR",
      "population": "49000000",
      "capital": "Pretoria",
      "continentName": "Africa"
  },
  {
      "countryCode": "ZM",
      "label": "Zambia",
      "currencyCode": "ZMW",
      "population": "13460305",
      "capital": "Lusaka",
      "continentName": "Africa"
  },
  {
      "countryCode": "ZW",
      "label": "Zimbabwe",
      "currencyCode": "ZWL",
      "population": "13061000",
      "capital": "Harare",
      "continentName": "Africa"
  }
]

export default function Signup(){

    const {Errors} = useContext(UserContext);
    function LoginForm(){

    const navigate = useNavigate();
    const inputFields = [
      { type:"text", name :"name", label: "Your Name" },
      { type:"text", name :"email", label: "Email" },
      // { type:"number", name :"phone", label: "phone" },
      { type:"password", name :"password", label: "Password" },
      // { type:"password", name :"confirmPassword", label: "Password confirmation" },
    ];


    // async function validatePassword(password) {
    //   const minLength = 8;
    //   const uppercaseRegex = /[A-Z]/;
    //   const lowercaseRegex = /[a-z]/;
    //   const digitRegex = /[0-9]/;
    //   const specialCharRegex = /[!@#$%^&*]/;
    //   if (password.length < minLength) {
    //       toast.error("Password must be at least 8 characters long.");
    //       return false;
    //   }
    //   if (!uppercaseRegex.test(password)) {
    //        toast.error("Password must contain at least one uppercase letter.");
    //       return false;
    //   }
    //   if (!lowercaseRegex.test(password)) {
    //       toast.error("Password must contain at least one lowercase letter.");
    //       return false;
    //   }
    //   if (!digitRegex.test(password)) {
    //        toast.error("Password must contain at least one digit.");
    //       return false;
    //   }
    //   if (!specialCharRegex.test(password)) {
    //       toast.error("Password must contain at least one special character.")
    //       return false;
    //   }
    // }

   
      
    const [data, setData] = useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      country: "",
      currency: "",
    });
    

    const chooseCountry = (e) => { 
      setData({ ...data, country: e.label, currency: e.currencyCode, country_code: e.countryCode});
    }

    const handleinput = (e) => {
      setData({ ...data, [e.target.name]: e.target.value});
    }

    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
      e.preventDefault();
      if (data.name === "" || data.email === "" || data.phone === "" || data.password === "" ) {
        toast.error("Please fill all the fields");
        return false
      }
      if(data && data.country === ''){
        toast.error("Please choose a country");
        return false
      } 
      const password = data.password;
      const minLength = 8;
      const uppercaseRegex = /[A-Z]/;
      const lowercaseRegex = /[a-z]/;
      const digitRegex = /[0-9]/;
      const specialCharRegex = /[!@#$%^&*]/;
      if (password.length < minLength) {
          toast.error("Password must be at least 8 characters long.");
          return false;
      }
      if (!uppercaseRegex.test(password)) {
           toast.error("Password must contain at least one uppercase letter.");
          return false;
      }
      if (!lowercaseRegex.test(password)) {
          toast.error("Password must contain at least one lowercase letter.");
          return false;
      }
      if (!digitRegex.test(password)) {
           toast.error("Password must contain at least one digit.");
          return false;
      }
      if (!specialCharRegex.test(password)) {
          toast.error("Password must contain at least one special character.")
          return false;
      }

      setLoading(true);
      const m = new Endpoints();
      const resp = m.sign_up({...data, confirmPassword : data.password});
      resp.then((res) => {
        setLoading(false);
        if(res.data.status){
          toast.success(res.data.message);
          setData({
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
          });
          setTimeout(()=>{
            navigate('/login');
          },2000);
        } else { 
          toast.error(res.data.message);
        }
      }).catch((err) => {
        console.log("errors",err);
        setLoading(false);
        Errors(err);
      });
    }

    return (
      <>
        <div className="countryselector">
          <Select classNamePrefix="react-select input"  placeholder={'Choose Country'}
          onChange={chooseCountry}
          options={countries} />
        </div>
        {inputFields.map((field, index) => (
          <input required key={index} name={field.name} onChange={handleinput} type={field.password} placeholder={field.label} className="input" />
        ))}

        <div className="m-auto table mt-8">
          <Button loading={loading} onclick={handleSubmit} type={"button"} text='Sign Up Now' classes={`m-auto`}  />
        </div>
      </>
    );
    }

    return (
      <Layout>
        <div className="h-[100vh] flex justify-center items-center" >
          <div className="w-full max-w-[500px] flex flex-col px-5 text-base leading-4 max-w-[590px] text-slate-500">
          <header>
              <Link to="/" className="self-center table  m-auto text-3xl font-mono font-bold text-center text-red-500 drunk lowercase">runstream</Link>
              <h2 className="text-center font-mono text-[18px] mt-6 text-white">Signup into runstream</h2>
          </header>
          <main className="mt-8" >
              <LoginForm />
          </main>
          <footer>
              <Link to="/login" className="text-center mt-4 text-normal table m-auto text-white">
                Already have an account?
              </Link>
          </footer>
          </div>
        </div>
      </Layout>
    );
}

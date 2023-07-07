"use client";
import { getLocalePartsFrom, locales, defaultLocales, getLanguageFromLocale, getCountryFromLocale } from "@/middleware";
import { usePathname, useRouter } from "next/navigation";

export default function Navigation({params}) {


    const pathname = usePathname();

    const navigate = useRouter()

    const changeLang = (country, lang) => {
      
      let newCountryLangCombo = locales.find((locale) => {
        const localeParts = getLocalePartsFrom({ locale })
        return localeParts.country === country && localeParts.lang === lang
      })
  
      if (newCountryLangCombo) {
        navigate.push(`/${country}/${lang}${pathname.replace(params.lang, "").replace(params.country, "")}`)
      } else {
        const combo = defaultLocales.find((locale) => {
          const localeParts = getLocalePartsFrom({ locale })
          return localeParts.country === country
        })
  
        const locale = combo
        const result = getLocalePartsFrom({ locale })
          navigate.push(`/${result.country}/${result.lang}${pathname.replace(params.lang, "").replace(params.country, "")}`)
      }
    }

    let countries = []
    locales.forEach((locale) => {
      let country = getCountryFromLocale(locale)[0]
      if (!countries.includes(country)) {
        countries.push(country)
      }
    })
    
    let languages = []
    locales.forEach((locale) => {
      let language = getLanguageFromLocale(locale)[0]
      let country = getCountryFromLocale(locale)[0]
      if (!languages.includes(language) && country == params.country.toUpperCase()) {
        languages.push(language)
      }
    })

    return (
        <div>
        <label htmlFor="countries">Choose a country:</label>
        <select id="countries" name="countries" value={params.country.toUpperCase()} onChange={(e) => { changeLang(e.target.value.toLowerCase(), params.lang.toLowerCase())}}>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        <label htmlFor="languages">Choose a language:</label>
        <select id="languages" name="languages" value={params.lang.toUpperCase()} onChange={(e) => { changeLang(params.country.toLowerCase(), e.target.value.toLowerCase())}}>
          {languages.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
      </div>
    )
  
}
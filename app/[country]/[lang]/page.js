"use client";
import { getLocalePartsFrom, locales, getTranslator, defaultLocales, defaultLocale } from "@/middleware";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export async function generateStaticParams() {
  return locales.map((locale) => getLocalePartsFrom({ locale }));
}

const Home = ({ params }) => {
  const [translate, setTranslate] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchTranslator = async () => {
      const translator = await getTranslator(
        `${params.lang}-${params.country.toUpperCase()}`
      );
      setTranslate(translator);
    };

    fetchTranslator();
  }, [params.lang, params.country]);

  const getCountryFromLocale = (locale) => {
    const country = locale.split("-")[1];
    return country ? [country.toUpperCase()] : [];
  };

  const getLanguageFromLocale = (locale) => {
    const country = locale.split("-")[0];
    return country ? [country.toUpperCase()] : [];
  };
  
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
      // if (result) {
        navigate.push(`/${result.country}/${result.lang}${pathname.replace(params.lang, "").replace(params.country, "")}`)
      // } else {
      //   const defaultLocaleParts = getLocalePartsFrom({ defaultLocale })
      //   navigate.push(`/${defaultLocaleParts.country}/${defaultLocaleParts.lang}${pathname.replace(params.lang, "").replace(params.country, "")}`)
      // }

    }
  }


  return (
    <>
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
      <div>
        <p>{JSON.stringify(params)}</p>
        <h1>
          {translate && translate("welcome.helloWorld")} {pathname}
        </h1>
      </div>
    </>
  );
};

export default Home;

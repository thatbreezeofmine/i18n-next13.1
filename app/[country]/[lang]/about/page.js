import { getLocalePartsFrom, locales, getTranslator } from "@/middleware"
import Navigation from "../navigation";

export async function generateStaticParams() {
  return locales.map(locale => getLocalePartsFrom({ locale }))
}

export default async function Demo({ params }) {
  const translate = await getTranslator(
    `${params.lang}-${params.country.toUpperCase()}`
  )
  return (
    <div>
      <Navigation params={params} />
      <p>{JSON.stringify(params)}</p>

      <h1>Example page: {translate("welcome.helloWorld")}</h1>
    </div>
  )
}

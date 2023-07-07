"use client";
import { getTranslator, } from "@/middleware";
import { useEffect, useState } from "react";
import Navigation from "./navigation";

export async function generateStaticParams() {
  return locales.map((locale) => getLocalePartsFrom({ locale }));
}

const Home = ({ params }) => {
  const [translate, setTranslate] = useState(null);

  useEffect(() => {
    const fetchTranslator = async () => {
      const translator = await getTranslator(
        `${params.lang}-${params.country.toUpperCase()}`
      );
      setTranslate(translator);
    };

    fetchTranslator();
  }, [params.lang, params.country]);

  return (
    <>
      <Navigation params={params} />
      <div>
        <p>{JSON.stringify(params)}</p>
        <h1>
          {translate && translate("welcome.helloWorld")}
        </h1>
      </div>
    </>
  );
};

export default Home;

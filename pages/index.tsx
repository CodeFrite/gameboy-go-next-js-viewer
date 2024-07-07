import Head from "next/head";
import Gameboy from "../components/gameboy";

export default function Home() {
  return (
    <>
      <Head>
        <title>codefrite-gameboy-go</title>
        <meta name="description" content="Gameboy emulator written in go" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main>
        <Gameboy />
      </main>
    </>
  );
}

import axios from "axios";
import {FormEvent, useEffect, useState} from "react";

function randomIntFromInterval(min:number, max:number) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function App() {
  const [url, setUrl] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [samples, setSamples] = useState<string[]>([]);
  const [activeSampleIndex, setActiveSampleIndex] = useState<null|number>(null);
  useEffect(() => {
    if (!samples.length) {
      axios.get('http://localhost:8080/samples')
        .then(response => {
          setSamples(response.data);
        });
    }
  }, []);
  useEffect(() => {
    if (samples.length) {
      randomSample();
      setInterval(() => {
        randomSample();
        console.log('random now');
      }, 3000);
    }
  }, [samples]);
  function randomSample() {
    const random = randomIntFromInterval(0, samples.length - 1)
    console.log(random);
    setActiveSampleIndex(random);
  }
  async function handleSubmit(ev:FormEvent) {
    ev.preventDefault();
    setLoadingMessage('Generating assets...');
    const assetsResponse = await axios.get(
      'http://localhost:8080/create-story?url='+encodeURIComponent(url)
    );
    const id = await assetsResponse.data;
    setLoadingMessage('Preparing your video...');
    const videoResponse = await axios.get('http://localhost:8080/build-video?id='+id);
    setLoadingMessage('');
    window.location.href = 'http://localhost:8080/'+videoResponse.data;
  }
  return (
    <>
      {loadingMessage && (
        <div className="fixed inset-0 z-20 bg-black/90 flex justify-center items-center">
          <p className="text-4xl text-center">
            {loadingMessage}
          </p>
        </div>
      )}
      <main className="max-w-2xl mx-auto flex gap-16 px-4">
        <div className="py-8 flex flex-col justify-center">
          <h1 className="text-4xl font-bold uppercase mb-4">
            <span className="text-5xl">
              URL to Video
            </span>
            <br />
            <span className="bg-gradient-to-br from-emerald-300 from-30% to-sky-300 bg-clip-text text-transparent">
              with power of AI
            </span>
          </h1>
          <form
            onSubmit={handleSubmit}
            className="grid gap-2">
            <input
              className="border-2 rounded-full bg-transparent text-white px-4 py-2 grow"
              value={url}
              onChange={ev => setUrl(ev.target.value)}
              type="url" placeholder="https://..."/>
            <button
              className="bg-emerald-500 text-white px-4 py-2 rounded-full uppercase"
              type="submit">
              Create&nbsp;video
            </button>
          </form>
        </div>
        <div className="py-4">
          <div className="text-gray-500 w-[240px] h-[380px] relative">
            {samples?.length > 0 && samples.map((sample,samplesKey) => (
              <video
                playsInline={true}
                muted={true}
                controls={false}
                loop={true}
                autoPlay={true}
                className="shadow-4xl shadow-sky-400 rounded-2xl overflow-hidden absolute top-2 transition-all duration-300"
                style={{
                  opacity: samplesKey === activeSampleIndex ? '1': '0',
                  transform: 'scaleX(1) scaleY(1) scaleZ(1) rotateX(0deg) rotateY(0deg) rotateZ(3deg) translateX(0px) translateY(0px) translateZ(0px) skewX(0deg) skewY(0deg)'
                }}
                src={'http://localhost:8080/' + sample + '/final.mp4'}></video>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

export default App

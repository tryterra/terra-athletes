import { useState } from "react";
import { TerraWidgetResponse } from "terra-api/lib/cjs/API/GenerateWidgetSessions";

// Pull a widget session from the backend and allow the user to connet a wearable
export default function ConnectTerra() {
  const [name, setName] = useState("");

  return (
    <div className="w-full p-10">
      <div className="flex m-auto gap-10 justify-center flex-wrap text-sky-900 text-center font-bold">
        <div className="flex flex-col gap-4">
          <div>1- Fill your name</div>
          <input
            placeholder="Display Name"
            onChange={(event) => {
              setName(event.target.value);
            }}
            className="focus:border-sky-900 border-sky-700 border-4 rounded-2xl px-5 py-3 outline-none"
          ></input>
        </div>
        <div className="flex flex-col gap-4">
          <div>2- Click to connect!</div>
          <button
            className="disabled:bg-gray-300 disabled:border-gray-500 text-white bg-sky-900 px-5 py-3 rounded-2xl border-4 border-sky-700"
            disabled={name === ""}
            onClick={() => {
              fetch("/api/connect?name=" + name).then((res) =>
                res
                  .json()
                  .then(
                    (r: TerraWidgetResponse) => (window.location.href = r.url)
                  )
              );
            }}
          >
            Connect Wearable
          </button>
        </div>
      </div>
    </div>
  );
}

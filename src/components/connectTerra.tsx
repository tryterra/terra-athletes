import { useState } from "react";
import { TerraWidgetResponse } from "terra-api/lib/cjs/API/GenerateWidgetSessions";

// Pull a widget session from the backend and allow the user to connet a wearable
export default function ConnectTerra() {
  const [name, setName] = useState("");

  return (
    <div className="w-full p-10">
      <div className="flex m-auto gap-10 justify-center flex-wrap">
        <input
          placeholder="Display Name"
          onChange={(event) => {
            setName(event.target.value);
          }}
          className="focus:border-purple-500 border-purple-300 border-2 rounded-2xl px-5 py-3 outline-none"
        ></input>
        <button
          className="disabled:bg-gray-300 text-white bg-purple-500 px-5 py-3 rounded-2xl"
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
  );
}

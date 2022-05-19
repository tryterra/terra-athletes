import { useEffect, useState } from "react";

enum RESOURCE {
  "OURA",
  "POLAR",
  "GOOGLE",
  "WAHOO",
  "FITBIT",
  "GARMIN",
}

// Schema of data storred in firebase
interface User {
  id: string;
  steps: number;
  total_burned_calories: number;
  name: string;
  resource: RESOURCE;
}

// A single user cell in the leaderboard
function UserCell(props: { user: User; rank: number }) {
  const { user, rank } = props;

  const metrics: { [id: string]: number | string } = {
    Steps: user.steps || 0,
    Calories: user.total_burned_calories?.toFixed(0) || 0,
  };

  return (
    <div
      className="p-8 flex flex-wrap justify-between gap-6 text-center m-auto rounded-xl w-full shadow-2xl bg-sky-900 text-white border-2 border-white"
      style={{ maxWidth: "400px" }}
    >
      <div className="font-bold grid grid-cols-1 my-auto">
        {rank + 1} - {user.name}
      </div>
      <div className="grid grid-cols-1 text-left">
        {Object.entries(metrics).map(([title, value], index) => (
          <div key={index} className="flex gap-4 justify-between">
            <div className="font-semibold">{title}</div>
            {value}
          </div>
        ))}
      </div>
      <div>
        <img
          src={"/app_icons/" + user.resource.toString().toLowerCase() + ".webp"}
          alt="resource-logo"
          className="h-12 w-12 rounded-xl border-2 border-white bg-white"
        />
      </div>
    </div>
  );
}

// Sample sorting function
// Application could be expanded by adding multiple ranking functions
// and a selector for which ranking method to use when displaying
function sortBySteps(data: { [id: string]: User }) {
  var sortableArray = Object.entries(data);
  var sortedArray = sortableArray.sort(([, a], [, b]) => b.steps - a.steps);
  return Object.fromEntries(sortedArray);
}

// Leaderboard component, pulls user data from the backend and displays it by ranking
export default function Leaderboard() {
  const [users, setUsers] = useState<{ [id: string]: User }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch("/api/users")
      .then((res) =>
        res.json().then((data: { [id: string]: User }) => {
          setUsers(sortBySteps(data));
          setLoading(false);
        })
      )
      .catch((e) => {
        setError(true);
        setLoading(false);
        console.log(e);
      });
  }, []);

  return (
    <div className="m-auto w-full text-center p-10 grid gap-6">
      {!loading && !error && (
        <div className="flex flex-wrap gap-6 justify-items-start">
          {Object.values(users).map((user, index) => {
            return <UserCell key={index} user={user} rank={index} />;
          })}
        </div>
      )}

      {error && <div>An error occured, please check the console logs.</div>}
      {loading && (
        <div className="flex gap-3 text-sky-900 m-auto w-full text-center">
          <span className="flex h-5 w-5 m-auto">
            <span className="animate-ping relative inline-flex h-full w-full rounded-full bg-sky-900 opacity-75"></span>
          </span>
        </div>
      )}
      <div className="italic text-center pt-10">
        Contact{" "}
        <a href="mailto:dev@tryterra.co" className="underline">
          dev@tryterra.co
        </a>{" "}
        to remove your account
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type Participant = {
  id: number;
  name: string;
  age: number;
  condition: string;
  createdAt: string;
};

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("");

  async function loadParticipants() {
    const res = await fetch("/api/participants");
    const data = await res.json();
    setParticipants(data);
  }

  useEffect(() => {
    loadParticipants();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/participants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        age: Number(age),
        condition,
      }),
    });

    setName("");
    setAge("");
    setCondition("");
    loadParticipants();
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Clinical Research Participants</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          className="border p-2 w-full"
          placeholder="Participant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        />
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add Participant
        </button>
      </form>

      <div className="space-y-3">
        {participants.map((p) => (
          <div key={p.id} className="border p-4 rounded">
            <div className="font-semibold">{p.name}</div>
            <div>Age: {p.age}</div>
            <div>Condition: {p.condition}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
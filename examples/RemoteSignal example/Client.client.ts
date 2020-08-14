import { RemoteSignal } from "shared/SimpleSignals";
import { Players } from "@rbxts/services";

const RemoteTest = new RemoteSignal("RemoteTest");

RemoteTest.Connect((msg: string) => { //OnClientEvent
	print(`Received from server: ${msg}`);
});

RemoteTest.Fire(`Hello from ${Players.LocalPlayer.Name}!`); //FireServer

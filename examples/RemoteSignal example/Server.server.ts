import { RemoteSignal } from "shared/SimpleSignals";

const RemoteTest = new RemoteSignal("RemoteTest");

RemoteTest.Connect((player: Player, msg: string) => { //OnServerEvent
	print(`Received from ${player.Name}: ${msg}`);
});

wait(1) //Make sure the client has connected

RemoteTest.FireAll("Hello from the server!");

export {};

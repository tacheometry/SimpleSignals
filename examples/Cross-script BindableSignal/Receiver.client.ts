import { BindableSignal } from "SimpleSignals";

const PrintNumber = new BindableSignal("PrintNumber");

PrintNumber.Connect((n: number) => {
	print(`Printed number ${tostring(n)}`)
});

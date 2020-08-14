import { BindableSignal } from "shared/SimpleSignals";

const PrintNumber = new BindableSignal("PrintNumber");

for(let n = 0; n <= 10; n++) {
	PrintNumber.Fire(n);
}

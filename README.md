# SimpleSignals
A [Roblox-TS](https://github.com/roblox-ts/roblox-ts) **RemoteEvent/RemoteFunction/BindableEvent** wrapper which puts and end to the hassle of managing events. You can **get straight to connecting and firing** without any WaitForChild/Instance.new boilerplate, while your event instances get created automatically in the background.
<hr>

## Usage
<details>
<summary>The event instances get created for you as you connect and fire</summary>

#### Example: working with an event called "z"
```ts
SimpleClient.on("z", callbackFunc)
```
gets called on the client, but `z` doesn't exist. SimpleSignals will `WaitForChild("z")` on the event folder, and when the event gets created on the server, it connects `callbackFunc` to it.<br>
*But how do events get created?*<br>
Any time you call a `z` RemoteEvent related function on the server (`on(z`, `once(z`, `fire(z`), a RemoteEvent with name `z` gets created - if such a RemoteEvent doesn't exist. RemoteEvents/RemoteFunctions cannot be created on the client.<br>
<br>
<br>
The same process follows for RemoteFunctions and BindableEvents (note that BindableEvents aren't parented anywhere).

</details>

You can import the module this way on the server:
```ts
import { Server as SimpleSignals } from "@rbxts/simplesignals";
```
and on the client:
```ts
import { Client as SimpleSignals } from "@rbxts/simplesignals";
```
**SimpleSignals** manages events cleanly, without you having to instantiate or to `WaitForChild`:
```ts
SimpleClient.on("printX", (player, x) => {
	print(x);
});
```
```ts
SimpleClient.fire("printX", "X");
```
You never have to create objects you only use once:
```ts
const printX = new Instance("RemoteEvent");
printX.Name = "printX";
printX.Parent = game.GetService("ReplicatedStorage");

printX.OnServerEvent.Connect((player, x) => {
	print(x);
});
```
```ts
const printX = game.GetService("ReplicatedStorage").WaitForChild("printX");

printX.FireServer("X");
```

<details>
<summary>Using the created instances outside of SimpleSignals</summary>

The following table describes where each event is stored:

| Event type     | Game location     | Folder name     | Path                                   |
|----------------|-------------------|-----------------|----------------------------------------|
| RemoteEvent    | ReplicatedStorage | RemoteEvents    | game.ReplicatedStorage.RemoteEvents    |
| RemoteFunction | ReplicatedStorage | RemoteFunctions | game.ReplicatedStorage.RemoteFunctions |
| BindableEvent  | none*             |                 |                                        |

*BindableEvents aren't parented anywhere. They're stored in an internal table.

</details>

### API
<details open>
<summary>RemoteEvents</summary>
	
+ Simple:**on**(`name`: string, `callback`: Function) → `Promise<RBXScriptConnection>`<br>
+ Simple:**once**(`name`: string, `callback`: Function) → `Promise<void>`<br>
+ Simple:**fire**(`name`: string, `...args`) → `void`<br>
+ Simple:**fireAllClients**(`name`: string, `...args`) → `void` (only on the server)<br>
+ Simple:**register**(`name`: string) → `void` (only on the server)<br>

</details>

<details open>
<summary>RemoteFunctions</summary>

+ Simple:**setCallback**(`name`: string, `callback`: Function) → `Promise<void>`<br>
+ Simple:**invoke\<T\>**(`name`: string, `...args`) → `Promise<T>`<br>
+ Simple:**registerFunction**(`name`: string) → `void` (only on the server)<br>

</details>

<details open>
<summary>BindableEvents</summary>

+ Simple:**onBindable**(`name`: string, `callback`: Function) → `RBXScriptConnection`<br>
+ Simple:**onceBindable**(`name`: string, `callback`: Function) → `void`<br>
+ Simple:**fireBindable**(`name`: string, `...args`) → `void`<br>
<br>
+ **new BindableRef**\<[T1, T2, ...]\>() → `BindableRef`<br>
+ BindableRef:**connect**(`callback`: Function) → `RBXScriptConnection`<br>
+ BindableRef:**fire**(`...args`: [T1, T2, ...]) → `void`<br>

</details>

<details open>
<summary></summary>
The library also has JSDoc comments provided.

### Examples
#### Redeem a code for a reward
##### main.server.ts
```ts
import { Server as simple } from "@rbxts/simplesignals";

const rewards = {
	"ABC123": 500,
	"1thousand": 1000
}
simple.on("redeemCode", (player, code: string) => {
	const reward = rewards[code];
	
	if (reward) {
		print(`${player.Name} just got ${reward} Coins!`);
	}
});
```

##### main.client.ts
```ts
import { Client as simple } from "@rbxts/simplesignals";
import { Players } from "@rbxts/services";
const LocalPlayer = Players.LocalPlayer;

const screenGui = new Instance("ScreenGui");
screenGui.Parent = LocalPlayer.WaitForChild("PlayerGui") as Folder;
const textBox = new Instance("TextBox");
textBox.Position = UDim2.fromScale(0.5, 0.5);
textBox.Parent = screenGui;

textBox.FocusLost.Connect(enterPressed => {
	if (enterPressed) simple.fire("redeemCode", textBox.Text);
});
```
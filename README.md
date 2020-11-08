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
The same process follows for RemoteFunctions and BindableEvents, except BindableEvents aren't stored in a Folder, rather they're used in an internal Map.

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
SimpleClient.on("printX", x => {
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

printX.OnServerEvent.Connect((_, x) => {
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

| Event type     | Game location     | Folder name     | Path                                   |   |
|----------------|-------------------|-----------------|----------------------------------------|---|
| RemoteEvent    | ReplicatedStorage | RemoteEvents    | game.ReplicatedStorage.RemoteEvents    |   |
| RemoteFunction | ReplicatedStorage | RemoteFunctions | game.ReplicatedStorage.RemoteFunctions |   |
| BindableEvent  | none*             |                 |                                        |   |

*BindableEvents are stored in an internal Map.

</details>

<details>
<summary><b>A recommended (easy) way of importing</b></summary>
	
If you don't want to write `import { Server as SimpleSignals } from "@rbxts/simplesignals"` every time you import the module, you can structure your files in this way:

![](https://user-images.githubusercontent.com/39647014/98453796-cf675000-2165-11eb-833b-4c08c50555b8.png)

Where `client/SimpleSignals` is:
```ts
import { Client } from "@rbxts/simplesignals";
export = Client;
```
and the same for `server/SimpleSignals`:
```ts
import { Server } from "@rbxts/simplesignals";
export = Server;
```
Of course, you can rename the files so they're shorter. I wrote it like this for the sake  of being explicit.

You can then import it from the client/server in this way:
```ts
import Simple from "server/SimpleSignals";
```
```ts
import Simple from "client/SimpleSignals";
```
(or something other than `Simple`)

</details>

### API
<details open>
<summary>RemoteEvents</summary>
	
+ Simple:**on**(`name`: string, `callback`: Function) → `RBXScriptConnection`<br>
+ Simple:**once**(`name`: string, `callback`: Function) → `void`<br>
+ Simple:**fire**(`name`: string, `...args`) → `void`<br>
+ Simple:**fireAllClients**(`name`: string, `...args`) → `void` (only on the server)<br>

</details>

<details open>
<summary>BindableEvents</summary>

+ Simple:**onBindable**(`name`: string, `callback`: Function) → `RBXScriptConnection`<br>
+ Simple:**onceBindable**(`name`: string, `callback`: Function) → `void`<br>
+ Simple:**fireBindable**(`name`: string, `...args`) → `void`<br>

</details>

<details open>
<summary>RemoteFunctions</summary>

+ Simple:**setCallback**(`name`: string, `callback`: Function) → `void`<br>
+ Simple:**invoke**(`name`: string, `...args`) → `unknown` (return value of the callback)<br>

</details>
The library also has JSDoc comments provided.

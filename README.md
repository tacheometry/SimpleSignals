# SimpleSignals
A [Roblox-TS](https://github.com/roblox-ts/roblox-ts) RemoteEvent/BindableEvent wrapper which puts and end to the hassle of creating event Instances.
<hr>

## Installation
> ⚠️ **This requires you to have a working [Roblox-TS](https://github.com/roblox-ts/roblox-ts) directory, e.g. after running `rbxtsc init`. The @rbxts/services package is required too.**

To install **SimpleSignals**, you will need to create some Folders which will be responsible for storing the `RemoteEvent` and `BindableEvent` Instances inside your game. To do this, run this code using the command bar in Studio:
```lua
local RemoteSignals = Instance.new("Folder"); RemoteSignals.Name = "RemoteSignals"; RemoteSignals.Parent = game:GetService("ReplicatedStorage"); local serverBindableSignals = Instance.new("Folder"); serverBindableSignals.Name = "BindableSignals"; serverBindableSignals.Parent = game:GetService("ServerScriptService"); local SimpleSignalsLocalInitializer = Instance.new("LocalScript"); SimpleSignalsLocalInitializer.Name = "SimpleSignalsLocalInitializer"; SimpleSignalsLocalInitializer.Source = 'local BindableSignals = Instance.new("Folder");\nBindableSignals.Name = "BindableSignals";\nBindableSignals.Parent = game:GetService("Players").LocalPlayer;'; SimpleSignalsLocalInitializer.Parent = game:GetService("ReplicatedFirst");
```
This will create 2 Folders and a LocalScript inside `ReplicatedFirst`, `ReplicatedStorage` and `ServerScriptService`.

### In VSCode
The last thing you need to do is to create the **SimpleSignals** module itself. Make a `.ts` file inside `src/shared` (or anywhere you can access it from both local and server files) and paste the [SimpleSignals source](https://github.com/insertLenny/SimpleSignals/blob/master/SimpleSignals.ts) inside of it.

## Usage
You can import the `RemoteSignal`/`BindableSignal` classes with the following line:
```ts
import { RemoteSignal, BindableSignal } from "shared/SimpleSignals";
```
<hr>

#### Firing and connecting a RemoteSignal
##### Server
```ts
const makeHello = new RemoteSignal("helloSignal");

function printHello(player: Player): void {
	print(`${player.Name} says hello!`);
}

makeHello.Connect(printHello);
```
##### Client
```ts
const makeHello = new RemoteSignal("helloSignal");

makeHello.Fire();
```
<br>

The client will wait for the `"helloSignal"` RemoteEvent to be created by the server (meaning you have to construct a RemoteSignal on the server side with the `"helloSignal"` name), then it will `Fire()` it. The server picks this up and runs the `printHello` function we connected.

```
--> insertLenny says hello!
```
<hr>

#### Firing and connecting a BindableSignal
##### Script 1 (receiver)
```ts
const PrintRandomNumberBindable = new BindableSignal("PrintRandomNumber");

PrintRandomNumberBindable.Connect(() => {
	print(tostring(math.random(1, 10));
});
```
##### Script 2 (sender)
```ts
const PrintRandomNumberBindable = new BindableSignal("PrintRandomNumber");

PrintRandomNumberBindable.Fire();
```
**BindableSignals** are the same as **RemoteSignals**, except the communication is server-to-server or client-to-client, not in between.

> ⚠️ **Two BindableSignals with the same name created on the server and the client are not the same instance**

## Logic behind Signals
When you construct a signal `new Signal(name)`, the following logic takes place:
* Is a signal with the same `name` already created? Return it.
* If not, create one with the `name` name and return it

### RemoteSignals (`ReplicatedStorage`)
#### RemoteSignal.Fire(`arg1, arg2, ...`)
##### On the server:
* Is `arg1` a Player? Call `RemoteEvent.FireClient` for that player.
* Is `arg1` not a Player, or `null`/`undefined`? Call `RemoteSignal.FireAll` with all arguments (if any).
> ⚠️ **The second case will print a warning, use `RemoteSignal.FireAll` if that's the intended action**.

##### On the client:
* Call `RemoteEvent.FireServer` with all arguments.

#### RemoteSignal.FireAll(`arg1, arg2, ...`)
##### On the server:
* Call `RemoteEvent.FireAllClients` with all arguments.

#### RemoteSignal.Connect(`func`)
Both of the cases below return a `RBXScriptConnection` which you can `.Disconnect()` from.
##### On the server:
* Connect `func` to `RemoteEvent.OnServerEvent`.

##### On the client:
* Connect `func` to `RemoteEvent.OnClientEvent`.

#### RemoteSignal.Destroy()
##### On the server:
* Destroy the `RemoteEvent` object (which means all connections also get disconnected).

### BindableSignals (`ServerScriptService`/`LocalPlayer`)
**BindableSignals** operate the same way for both the client and server. A BindableSignal on the server has no relation to one on the client, and vice versa.
#### BindableSignal.Fire(`arg1, arg2, ...`)
* Call `BindableEvent.Fire` with all arguments.

#### BindableSignal.Connect(`func`)
* Connect `func` to `BindableEvent.Event`.

#### BindableSignal.Destroy()

* Destroy the `BindableEvent`, removing all connections.

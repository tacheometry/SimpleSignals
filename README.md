# SimpleSignals
A [Roblox-TS](https://github.com/roblox-ts/roblox-ts) <b>RemoteEvent/RemoteFunction/BindableEvent</b> wrapper which puts and end to the hassle of managing events. You can <b>get straight to connecting and firing</b> without any WaitForChild/Instance.new boilerplate, while your event instances get created automatically in the background.
<hr>

## Usage
You can import the module this way on the server:
```ts
import { Server as SimpleSignals } from "shared/SimpleSignals";
```
and on the client:
```ts
import { Client as SimpleSignals } from "shared/SimpleSignals";
```
<details>
<summary><b>Recommended (easy) way of importing</b></summary>
	
If you don't want to write `import { Server as SimpleSignals } from "shared/SimpleSignals"` every time you import the module, you can structure your files in this way:

![](https://cdn.discordapp.com/attachments/455748680452931597/774048957046849566/unknown.png)

Where `client/SimpleSignals` is:
```ts
import { Client } from "shared/SimpleSignals";
export = Client;
```
and the same for `server/SimpleSignals`:
```ts
import { Server } from "shared/SimpleSignals";
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
	
+ Simple:<b>on</b>(`name`: string, `callback`: Function) → `RBXScriptConnection`<br>
+ Simple:<b>once</b>(`name`: string, `callback`: Function) → `void`<br>
+ Simple:<b>fire</b>(`name`: string, `...args`) → `void`<br>
+ Simple:<b>fireAllClients</b>(`name`: string, `...args`) → `void` (only on the server)<br>

</details>

<details open>
<summary>BindableEvents</summary>

+ Simple:<b>onBindable</b>(`name`: string, `callback`: Function) → `RBXScriptConnection`<br>
+ Simple:<b>onceBindable</b>(`name`: string, `callback`: Function) → `void`<br>
+ Simple:<b>fireBindable</b>(`name`: string, `...args`) → `void`<br>

</details>

<details open>
<summary>RemoteFunctions</summary>

+ Simple:<b>setCallback</b>(`name`: string, `callback`: Function) → `void`<br>
+ Simple:<b>invoke</b>(`name`: string, `...args`) → `unknown` (return value of the callback)<br>

</details>

The library also has JSDoc comments provided inside the code.

## Installation
> ⚠️ **This requires you to have a working [Roblox-TS](https://github.com/roblox-ts/roblox-ts) directory, e.g. after running `rbxtsc init`. The [@rbxts/services](https://www.npmjs.com/package/@rbxts/services) package is required too.**

To install **SimpleSignals**, copy [the source](SimpleSignals.ts) into a `.ts` file under the shared directory of your project.You can also use the [provided Lua file](SimpleSignals.lua) if you want to use it without Roblox-TS.

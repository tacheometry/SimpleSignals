# SimpleSignals
A [Roblox-TS](https://github.com/roblox-ts/roblox-ts) RemoteEvent/BindableEvent wrapper which puts and end to the hassle of managing events.
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
<summary><b>Recommended (easy) way of importing<b></summary>
	
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

</details>

### API
The library has everything fully documented with JSDoc comments if you still want to use it before I add the documentation here.

## Installation
> ⚠️ **This requires you to have a working [Roblox-TS](https://github.com/roblox-ts/roblox-ts) directory, e.g. after running `rbxtsc init`. The [@rbxts/services](https://www.npmjs.com/package/@rbxts/services) package is required too.**

To install **SimpleSignals**, copy [the source](https://github.com/tacheometry/SimpleSignals/releases) into a `.ts` file under the shared directory of your project.

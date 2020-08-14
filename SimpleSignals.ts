import { ServerScriptService, ReplicatedStorage, RunService, Players } from "@rbxts/services";

const REMOTE_FOLDER_NAME: string = "RemoteSignals";
const BINDABLE_FOLDER_NAME: string = "BindableSignals";

function GetBindableFolder(): Folder {
	if(RunService.IsServer()) return ServerScriptService.FindFirstChild(BINDABLE_FOLDER_NAME) as Folder;
	else return Players.LocalPlayer.FindFirstChild(BINDABLE_FOLDER_NAME) as Folder;
}

const RemoteFolder: Folder = ReplicatedStorage.FindFirstChild(REMOTE_FOLDER_NAME) as Folder;

export class BindableSignal {
	private readonly _bindableEvent: BindableEvent
	
	constructor(name: string) {
		let BindableFolder: Folder = GetBindableFolder();

		let BindableEvent = BindableFolder.FindFirstChild(name) as BindableEvent|null;
		
		if(!BindableEvent) {
			BindableEvent = new Instance("BindableEvent");
			
			BindableEvent.Name = name;
			BindableEvent.Parent = BindableFolder;
		}

		this._bindableEvent = BindableEvent;
	}

	public Connect(func: (...args: any[]) => void): RBXScriptConnection {
		return this._bindableEvent.Event.Connect(func);
	}

	public Fire(...args: unknown[]): void {
		this._bindableEvent.Fire(...args)
	}

	public Destroy(): void {
		this._bindableEvent.Destroy();
	}
}


export class RemoteSignal {
	private readonly _remoteEvent: RemoteEvent;
	
	constructor(name: string) {
		if(RemoteFolder.FindFirstChild(name)) {
			this._remoteEvent = RemoteFolder.FindFirstChild(name) as RemoteEvent;			
		} else {
			if(RunService.IsClient()) {
				RemoteFolder.WaitForChild(name);

				this._remoteEvent = RemoteFolder.FindFirstChild(name) as RemoteEvent;
			} else {
				const RemoteEvent = new Instance("RemoteEvent");
				RemoteEvent.Name = name;
				RemoteEvent.Parent = RemoteFolder;

				this._remoteEvent = RemoteEvent;
			}			
		}
	}

	public Connect(func: (...args: any[]) => void): RBXScriptConnection {
		if(RunService.IsServer()) {
			return this._remoteEvent.OnServerEvent.Connect(func);
		} else {
			return this._remoteEvent.OnClientEvent.Connect(func);
		}
	}

	public Fire(...args: unknown[]): void {		
		if(RunService.IsServer()) {
			const player = args[1];
			
			if(typeIs(player, "Instance") && player.IsA("Player")) this._remoteEvent.FireClient(player, ...args);
			else {
				this._remoteEvent.FireAllClients(...args);
				warn("Firing all clients because of no player parameter")
			}
		} else {
			this._remoteEvent.FireServer(...args);
		}
	}

	public FireAll(...args: unknown[]): void {
		this._remoteEvent.FireAllClients(...args);
	}

	public Destroy(): void {
		if(!RunService.IsServer()) return error("Attempt to destroy a RemoteEvent on the client");

		this._remoteEvent.Destroy();
	}
}

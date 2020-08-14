import { ServerScriptService, ReplicatedStorage, RunService, Players } from "@rbxts/services";


const REMOTE_FOLDER_NAME: string = "RemoteSignals";

function GetBindableFolder(): Folder {
	let Parent: Instance;
	
	if(RunService.IsServer()) Parent = ServerScriptService;
	else Parent = Players.LocalPlayer;

	if(Parent.FindFirstChild("BindableEvents")) return Parent.FindFirstChild("BindableEvents") as Folder;
	else {
		const BindableFolder = new Instance("Folder");
		BindableFolder.Name = "BindableSignals"
		BindableFolder.Parent = Parent;

		return BindableFolder;
	}
}

export class BindableSignal {
	private readonly _bindableEvent: BindableEvent
	
	constructor(name: string) {
		let bindableFolder: Folder = GetBindableFolder();

		let bindableEvent = bindableFolder.FindFirstChild(name) as BindableEvent|undefined;
		
		if(!bindableEvent) {
			bindableEvent = new Instance("BindableEvent");
			
			bindableEvent.Name = name;
			bindableEvent.Parent = bindableFolder;
		}

		this._bindableEvent = bindableEvent;
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
		let RemoteFolder: Folder;
		
		if(!ReplicatedStorage.FindFirstChild(REMOTE_FOLDER_NAME) && RunService.IsServer()) {
			RemoteFolder = new Instance("Folder");
			RemoteFolder.Name = REMOTE_FOLDER_NAME;
			RemoteFolder.Parent = ReplicatedStorage;
		}

		RemoteFolder = ReplicatedStorage.WaitForChild(REMOTE_FOLDER_NAME) as Folder;
		
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
			print("conn server")

			return this._remoteEvent.OnServerEvent.Connect(func);
		} else {
			print("conn client")

			return this._remoteEvent.OnClientEvent.Connect(func);
		}
	}

	public Fire(player?: Player, ...args: unknown[]): void {
		if(RunService.IsServer()) {
			if(player) this._remoteEvent.FireClient(player, ...args);
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

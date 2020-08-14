-- Compiled with https://roblox-ts.github.io v0.3.2
-- August 14, 2020, 4:52 PM Eastern European Summer Time

local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"));
local exports = {};
local _0 = TS.import(script, TS.getModule(script, "services"));
local ServerScriptService, ReplicatedStorage, RunService, Players = _0.ServerScriptService, _0.ReplicatedStorage, _0.RunService, _0.Players;
local REMOTE_FOLDER_NAME = "RemoteSignals";
local function GetBindableFolder()
	local Parent;
	if RunService:IsServer() then
		Parent = ServerScriptService;
	else
		Parent = Players.LocalPlayer;
	end;
	if Parent:FindFirstChild("BindableEvents") then
		return Parent:FindFirstChild("BindableEvents");
	else
		local BindableFolder = Instance.new("Folder");
		BindableFolder.Name = "BindableSignals";
		BindableFolder.Parent = Parent;
		return BindableFolder;
	end;
end;
local BindableSignal;
do
	BindableSignal = setmetatable({}, {
		__tostring = function() return "BindableSignal" end;
	});
	BindableSignal.__index = BindableSignal;
	function BindableSignal.new(...)
		local self = setmetatable({}, BindableSignal);
		self:constructor(...);
		return self;
	end;
	function BindableSignal:constructor(name)
		local bindableFolder = GetBindableFolder();
		local bindableEvent = bindableFolder:FindFirstChild(name);
		if not (bindableEvent) then
			bindableEvent = Instance.new("BindableEvent");
			bindableEvent.Name = name;
			bindableEvent.Parent = bindableFolder;
		end;
		self._bindableEvent = bindableEvent;
	end;
	function BindableSignal:Connect(func)
		return self._bindableEvent.Event:Connect(func);
	end;
	function BindableSignal:Fire(...)
		local args = { ... };
		self._bindableEvent:Fire(unpack(args));
	end;
	function BindableSignal:Destroy()
		self._bindableEvent:Destroy();
	end;
end;
local RemoteSignal;
do
	RemoteSignal = setmetatable({}, {
		__tostring = function() return "RemoteSignal" end;
	});
	RemoteSignal.__index = RemoteSignal;
	function RemoteSignal.new(...)
		local self = setmetatable({}, RemoteSignal);
		self:constructor(...);
		return self;
	end;
	function RemoteSignal:constructor(name)
		local RemoteFolder;
		if (not (ReplicatedStorage:FindFirstChild(REMOTE_FOLDER_NAME))) and (RunService:IsServer()) then
			RemoteFolder = Instance.new("Folder");
			RemoteFolder.Name = REMOTE_FOLDER_NAME;
			RemoteFolder.Parent = ReplicatedStorage;
		end;
		RemoteFolder = ReplicatedStorage:WaitForChild(REMOTE_FOLDER_NAME);
		if RemoteFolder:FindFirstChild(name) then
			self._remoteEvent = RemoteFolder:FindFirstChild(name);
		else
			if RunService:IsClient() then
				RemoteFolder:WaitForChild(name);
				self._remoteEvent = RemoteFolder:FindFirstChild(name);
			else
				local RemoteEvent = Instance.new("RemoteEvent");
				RemoteEvent.Name = name;
				RemoteEvent.Parent = RemoteFolder;
				self._remoteEvent = RemoteEvent;
			end;
		end;
	end;
	function RemoteSignal:Connect(func)
		if RunService:IsServer() then
			print("conn server");
			return self._remoteEvent.OnServerEvent:Connect(func);
		else
			print("conn client");
			return self._remoteEvent.OnClientEvent:Connect(func);
		end;
	end;
	function RemoteSignal:Fire(player, ...)
		local args = { ... };
		if RunService:IsServer() then
			if player then
				self._remoteEvent:FireClient(player, unpack(args));
			else
				self._remoteEvent:FireAllClients(unpack(args));
				warn("Firing all clients because of no player parameter");
			end;
		else
			self._remoteEvent:FireServer(unpack(args));
		end;
	end;
	function RemoteSignal:FireAll(...)
		local args = { ... };
		self._remoteEvent:FireAllClients(unpack(args));
	end;
	function RemoteSignal:Destroy()
		if not (RunService:IsServer()) then
			return error("Attempt to destroy a RemoteEvent on the client");
		end;
		self._remoteEvent:Destroy();
	end;
end;
exports.BindableSignal = BindableSignal;
exports.RemoteSignal = RemoteSignal;
return exports;

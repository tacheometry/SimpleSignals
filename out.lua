-- Compiled with https://roblox-ts.github.io v0.3.2
-- August 14, 2020, 10:48 PM Eastern European Summer Time

local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"));
local exports = {};
local _0 = TS.import(script, TS.getModule(script, "services"));
local ServerScriptService, ReplicatedStorage, RunService, Players = _0.ServerScriptService, _0.ReplicatedStorage, _0.RunService, _0.Players;
local REMOTE_FOLDER_NAME = "RemoteSignals";
local BINDABLE_FOLDER_NAME = "BindableSignals";
local function GetBindableFolder()
	if RunService:IsServer() then
		return ServerScriptService:FindFirstChild(BINDABLE_FOLDER_NAME);
	else
		return Players.LocalPlayer:FindFirstChild(BINDABLE_FOLDER_NAME);
	end;
end;
local RemoteFolder = ReplicatedStorage:FindFirstChild(REMOTE_FOLDER_NAME);
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
		local BindableFolder = GetBindableFolder();
		local BindableEvent = BindableFolder:FindFirstChild(name);
		if not (BindableEvent) then
			BindableEvent = Instance.new("BindableEvent");
			BindableEvent.Name = name;
			BindableEvent.Parent = BindableFolder;
		end;
		self._bindableEvent = BindableEvent;
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
			return self._remoteEvent.OnServerEvent:Connect(func);
		else
			return self._remoteEvent.OnClientEvent:Connect(func);
		end;
	end;
	function RemoteSignal:Fire(...)
		local args = { ... };
		if RunService:IsServer() then
			local player = args[2];
			if (typeof(player) == "Instance") and (player:IsA("Player")) then
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

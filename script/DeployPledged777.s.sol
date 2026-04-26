// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {Pledged777} from "../contracts/Pledged777.sol";

contract DeployPledged777 is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("RELAYER_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);
        Pledged777 c = new Pledged777();
        vm.stopBroadcast();
        console.log("Pledged777 deployed at:", address(c));
    }
}

#!/usr/bin/env node
//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

import * as program from 'commander';
import { App } from '../app'
import * as fs from 'fs';
import * as logger from 'winston';
import * as path from 'path';
import * as child from 'child_process';

program
  .usage('[options]')
  .option('-s, --server <addr|domain>', 'Server Address', String)
  .option('-p, --port <number>', 'Server Port Number', Number.parseInt)
  .option('-l, --localport <number>', 'Local Port Number', Number.parseInt)
  .option('-m, --method <algorithm>', 'Cipher Algorithm', String)
  .option('-k, --password <password>', 'Password', String)
  .option('-c, --config <path>', 'Configuration File Path', String)
  .option('-a, --any', 'Listen Any Connection')
  .option('-t, --timeout [number]', 'Timeout (second)')
  .option('-f, --fork', 'Run as Daemon')
  .option('-b, --dontbypasslocal', "DON'T Bypass Local Address")
  .option('-u, --socsk5username [name]', 'Socks5 Proxy Username', String)
  .option('-w, --socks5password [password]', 'Socks5 Proxy Password', String)
  .option('-i, --plugin [name]', 'Plugin Name', String)
  .parse(process.argv);
  
var args = <any>program;

function parseFile(path: string) {
  if (!path) return;
  if (!fs.existsSync(path)) return;
  
  var content = fs.readFileSync(path).toString();
  
  try {
    return JSON.parse(content);
  } catch(ex) {
    logger.warn('Configuration file error');
    logger.warn(ex.message);
  }
}

var fileOptions = parseFile(args.config) || {};
  
var argsOptions = {
  addr: args.any ? '0.0.0.0' : 'localhost',
  port: args.localport,
  serverAddr: args.server,
  serverPort: args.port,
  cipherAlgorithm: args.method,
  password: args.password,
  socks5Username: args.socks5username,
  socks5Password: args.socks5password,
  timeout: args.timeout,
  plugin: args.plugin,
  bypassLocal: args.dontbypasslocal ? false : true
}

if (args.fork && !process.env.__daemon) {
  logger.info('Run as daemon');
  process.env.__daemon = true;
  var cp = child.spawn(process.argv[1], process.argv.skip(2).toArray(), { detached: true, stdio: 'ignore', env: process.env, cwd: process.cwd() });
  cp.unref();
  console.log('Child PID: ', cp.pid);
  process.exit(0);
}

Object.getOwnPropertyNames(argsOptions).forEach(n => argsOptions[n] = argsOptions[n] === undefined ? fileOptions[n] : argsOptions[n]);
new App(argsOptions);

process.title = process.env.__daemon ? path.basename(process.argv[1]) + 'd' : 'LightSword Client';
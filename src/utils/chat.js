// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2019 Stiftung Pillar Project

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
const { utils } = require('ethers');

export function generateChatPassword(privateKey: string): string {
  const strToHash = privateKey.slice(4, 10);
  // NOTE: utils.id() computes the keccak256 cryptographic hash of a UTF-8 string, returns as a hex string.
  return utils.id(strToHash).slice(-10);
}

export function getConnectionStateCheckParamsByUserId(getState: Function, targetUserId: string) {
  const {
    connectionIdentityKeys: { data: connectionIdentityKeys },
  } = getState();
  const {
    userId,
    sourceIdentityKey,
    targetIdentityKey,
  } = connectionIdentityKeys.find(entry => entry.targetUserId === targetUserId);
  return {
    userId,
    targetUserId,
    sourceIdentityKey,
    targetIdentityKey,
  };
}

export function getConnectionStateCheckParamsByUsername(getState: Function, username: string) {
  const {
    contacts: { data: contacts },
  } = getState();
  const { id: targetUserId } = contacts.find(contact => contact.username === username);
  return getConnectionStateCheckParamsByUserId(getState, targetUserId);
}

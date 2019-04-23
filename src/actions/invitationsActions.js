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
import { UPDATE_INVITATIONS } from 'constants/invitationsConstants';
import { ADD_NOTIFICATION } from 'constants/notificationConstants';
import type { ApiUser } from 'models/Contacts';
import {
  fetchOldInviteNotificationsAction,
  acceptOldInvitationAction,
  rejectOldInvitationAction,
  cancelOldInvitationAction,
} from 'actions/oldInvitationsActions';
import { mapIdentityKeysAction } from 'actions/connectionKeyPairActions';
import { updateConnectionsAction } from 'actions/connectionsActions';
import { getIdentityKeyPairs } from 'utils/connections';
import { saveDbAction } from './dbActions';

export const fetchInviteNotificationsAction = () => {
  return async (dispatch: Function) => {
    await dispatch(fetchOldInviteNotificationsAction());
  };
};

export const sendInvitationAction = (user: ApiUser) => {
  return async (dispatch: Function, getState: Function, api: Object) => {
    const {
      user: { data: { walletId } },
      invitations: { data: invitations },
      connectionKeyPairs: { data: connectionKeyPairs },
      connectionIdentityKeys: { data: connectionIdentityKeys },
    } = getState();

    const index = invitations.findIndex(el => el.id === user.id);
    if (index >= 0) {
      dispatch(({
        type: ADD_NOTIFICATION,
        payload: { message: 'Invitation has already been sent' },
      }));
      return;
    }

    const {
      sourceIdentityKey,
      targetIdentityKey,
      connIdKeyResult,
    } = getIdentityKeyPairs(user.id, connectionIdentityKeys, connectionKeyPairs);

    const sentInvitation = await api.sendInvitation(
      user.id,
      sourceIdentityKey,
      targetIdentityKey,
      walletId,
    );

    if (!sentInvitation) {
      return;
    }

    if (!connIdKeyResult) {
      await dispatch(mapIdentityKeysAction(1));
    }

    dispatch(({
      type: ADD_NOTIFICATION,
      payload: { message: 'Invitation sent' },
    }));

    dispatch(updateConnectionsAction());
  };
};

export const acceptInvitationAction = (invitation: Object) => {
  return async (dispatch: Function, getState: Function, api: Object) => {
    if (!invitation.sourceIdentityKey) {
      await dispatch(acceptOldInvitationAction(invitation));
      return;
    }
    const {
      user: { data: { walletId } },
      invitations: { data: invitations },
      connectionKeyPairs: { data: connectionKeyPairs },
      connectionIdentityKeys: { data: connectionIdentityKeys },
    } = getState();

    const {
      sourceIdentityKey,
      targetIdentityKey,
      connIdKeyResult,
    } = getIdentityKeyPairs(invitation.id, connectionIdentityKeys, connectionKeyPairs);

    const sourceUserIdentityKeys = {
      sourceIdentityKey,
      targetIdentityKey,
    };

    const targetUserIdentityKeys = {
      sourceIdentityKey: invitation.sourceIdentityKey,
      targetIdentityKey: invitation.targetIdentityKey,
    };

    const acceptedInvitation = await api.acceptInvitation(
      invitation.id,
      sourceUserIdentityKeys,
      targetUserIdentityKeys,
      walletId,
    );

    if (!acceptedInvitation) {
      dispatch(({
        type: ADD_NOTIFICATION,
        payload: { message: 'Invitation doesn\'t exist' },
      }));
      dispatch(updateConnectionsAction());
      return;
    }

    if (!connIdKeyResult) {
      await dispatch(mapIdentityKeysAction(1));
    }

    const updatedInvitations = invitations.filter(({ id }) => id !== invitation.id);
    dispatch(saveDbAction('invitations', { invitations: updatedInvitations }, true));

    dispatch({
      type: UPDATE_INVITATIONS,
      payload: updatedInvitations,
    });
    dispatch(({
      type: ADD_NOTIFICATION,
      payload: { message: 'Connection request accepted' },
    }));
    dispatch(updateConnectionsAction());
  };
};

export const cancelInvitationAction = (invitation: Object) => {
  return async (dispatch: Function, getState: Function, api: Object) => {
    if (!invitation.sourceIdentityKey) {
      await dispatch(cancelOldInvitationAction(invitation));
      return;
    }

    const {
      user: { data: { walletId } },
      invitations: { data: invitations },
    } = getState();

    const { sourceUserIdentityKeys: { sourceIdentityKey, targetIdentityKey } } = invitation;

    const cancelledInvitation = await api.cancelInvitation(
      invitation.id,
      sourceIdentityKey,
      targetIdentityKey,
      walletId,
    );

    if (!cancelledInvitation) {
      dispatch(({
        type: ADD_NOTIFICATION,
        payload: { title: invitation.username, message: 'Already accepted your request' },
      }));
      dispatch(updateConnectionsAction());
      return;
    }

    dispatch(({
      type: ADD_NOTIFICATION,
      payload: { message: 'Invitation cancelled' },
    }));

    const updatedInvitations = invitations.filter(({ id }) => id !== invitation.id);
    dispatch(saveDbAction('invitations', { invitations: updatedInvitations }, true));

    dispatch({
      type: UPDATE_INVITATIONS,
      payload: updatedInvitations,
    });

    dispatch(updateConnectionsAction());
  };
};

export const rejectInvitationAction = (invitation: Object) => {
  return async (dispatch: Function, getState: Function, api: Object) => {
    if (!invitation.sourceIdentityKey) {
      await dispatch(rejectOldInvitationAction(invitation));
      return;
    }

    const {
      user: { data: { walletId } },
      invitations: { data: invitations },
    } = getState();

    const rejectedInvitation = await api.rejectInvitation(
      invitation.id,
      invitation.sourceIdentityKey,
      invitation.targetIdentityKey,
      walletId,
    );

    if (!rejectedInvitation) {
      dispatch(({
        type: ADD_NOTIFICATION,
        payload: { message: 'Invitation doesn\'t exist' },
      }));
      dispatch(updateConnectionsAction());
      return;
    }

    dispatch(({
      type: ADD_NOTIFICATION,
      payload: { message: 'Invitation rejected' },
    }));

    const updatedInvitations = invitations.filter(({ id }) => id !== invitation.id);
    dispatch(saveDbAction('invitations', { invitations: updatedInvitations }, true));

    dispatch({
      type: UPDATE_INVITATIONS,
      payload: updatedInvitations,
    });

    dispatch(updateConnectionsAction());
  };
};

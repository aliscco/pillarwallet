// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2021 Stiftung Pillar Project

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

import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { range } from 'lodash';

// Utils
import { spacing } from 'utils/variables';

// Types
import type { ViewStyleProp } from 'utils/types/react-native';

type Props = {|
  pageCount: number,
  currentPage: number,
  onChangePage: (number) => mixed,
  style?: ViewStyleProp,
  renderLeft?: () => React.Node,
|};

function PagerControl({ pageCount, currentPage, onChangePage, style, renderLeft }: Props) {
  if (pageCount <= 0) return null;

  return (
    <Container style={style}>
      {range(pageCount).map((page) => (
        <TouchableOpacity key={page} onPress={() => onChangePage(page)}>
          {page === currentPage ? <ActiveDot /> : <Dot />}
        </TouchableOpacity>
      ))}
      {!!renderLeft && <LeftFloat>{renderLeft()}</LeftFloat>}
    </Container>
  );
}

export default PagerControl;

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const Dot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  margin: ${spacing.medium}px ${spacing.small / 2}px;
  background-color: ${({ theme }) => theme.colors.pagerInactive};
`;

const ActiveDot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  margin: ${spacing.medium}px ${spacing.small / 2}px;
  background-color: ${({ theme }) => theme.colors.pagerActive};
`;

const LeftFloat = styled.View`

`;


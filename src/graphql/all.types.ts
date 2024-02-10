import { DateTimeResolver } from 'graphql-scalars';

import * as Common from './common.resolve';
import * as Receipt from './receipt.resolve';

export const scalars = [{ Date: DateTimeResolver }];

export const gqlModules = [Common, Receipt];
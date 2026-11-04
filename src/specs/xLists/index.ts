import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const COMMAND = 'src/cli/twitter/helpers/list.ts'
const ENGINE = 'python/twitterApi/engine.py'

export const xLists = {
  description: "An X account's own lists, shown, made once and added to through its one session",
  specPath: 'docs/specs/xLists.md',
  codePaths: [COMMAND, ENGINE],
  anchors: {
    'REQ-XLISTS-01': [
      { kind: 'symbol', file: COMMAND, name: 'listCommand' },
      { kind: 'symbol', file: ENGINE, name: 'list_create' },
      { kind: 'symbol', file: ENGINE, name: 'list_add' },
      { kind: 'symbol', file: ENGINE, name: 'lists_of' },
    ],
  },
  rubrics: {
    'REQ-XLISTS-01': noul('Does listCommand read the lists with the lists action before anything else, answer create with the existing list when one of that name is there and otherwise call listCreate only with --live and --approvedBy, find the list for add by id or name and refuse a missing one with listInvalid, and does list_create return the existing list as already before calling create_list, does list_add look a handle up with get_user_by_screen_name before add_list_member, and are listCreate and listAdd in WRITES?'),
    unspecifiedBehavior: noul('Does any list command change a list without live and approvedBy, make a second list of the same name, or remove anyone from a list, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-XLISTS-01': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}

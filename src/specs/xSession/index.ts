import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const ENGINE = 'python/twitterApi/engine.py'
const HOST = 'python/twitterApi/host.py'
const SESSION = 'src/twitter/account/session/client.ts'
const GQL = 'vendor/twikit/twikit/client/gql.py'
const TWIKIT = 'vendor/twikit/twikit/client/client.py'

export const xSession = {
  description: 'How an X account talks to X: directly, through its one engine host, one call at a time',
  specPath: 'docs/specs/xSession.md',
  codePaths: [ENGINE, HOST, SESSION, GQL, TWIKIT, 'vendor/twikit/twikit/constants.py'],
  anchors: {
    'REQ-XSESSION-01': [
      { kind: 'symbol', file: ENGINE, name: 'client_for' },
      { kind: 'symbol', file: SESSION, name: 'runTwitterEngine' },
    ],
    'REQ-XSESSION-02': [
      { kind: 'value', file: 'vendor/twikit/twikit/constants.py', name: 'IMPERSONATE', equals: 'safari17_0' },
      { kind: 'string', file: TWIKIT, includes: 'allow_redirects' },
      { kind: 'symbol', file: 'python/checks/twikitTransport.py', name: 'scan' },
    ],
    'REQ-XSESSION-03': [
      { kind: 'value', file: ENGINE, name: 'LOCK_WAIT_SECONDS', equals: 900 },
      { kind: 'value', file: ENGINE, name: 'UNLOCKED', equals: ['xchatWatch'] },
      { kind: 'symbol', file: ENGINE, name: 'AccountLock' },
      { kind: 'string', file: ENGINE, includes: 'engine.lock' },
      { kind: 'string', file: ENGINE, includes: 'accountBusy' },
    ],
    'REQ-XSESSION-04': [
      { kind: 'value', file: ENGINE, name: 'SPACING_SECONDS', equals: [4, 11] },
      { kind: 'value', file: ENGINE, name: 'READ_SPACING_SECONDS', equals: [0.8, 2.5] },
      { kind: 'symbol', file: ENGINE, name: 'spacing_wait' },
      { kind: 'symbol', file: ENGINE, name: 'mark_call' },
    ],
    'REQ-XSESSION-05': [
      { kind: 'value', file: ENGINE, name: 'TRANSACTION_SECONDS', equals: 10800 },
      { kind: 'string', file: ENGINE, includes: 'clientTransaction.json' },
      { kind: 'symbol', file: ENGINE, name: 'restore_transaction' },
      { kind: 'symbol', file: ENGINE, name: 'keep_transaction' },
    ],
    'REQ-XSESSION-06': [
      { kind: 'string', file: ENGINE, includes: 'LOG_TWITTER_HOST' },
      { kind: 'symbol', file: HOST, name: 'call' },
    ],
    'REQ-XSESSION-07': [
      { kind: 'symbol', file: ENGINE, name: 'SESSIONS' },
      { kind: 'symbol', file: ENGINE, name: 'HOSTING' },
    ],
    'REQ-XSESSION-08': [
      { kind: 'string', file: HOST, includes: 'host.lock' },
      { kind: 'symbol', file: HOST, name: 'Host' },
    ],
    'REQ-XSESSION-09': [
      { kind: 'string', file: HOST, includes: 'xSessionHostDown' },
      { kind: 'symbol', file: HOST, name: 'connect_host' },
    ],
    'REQ-XSESSION-10': [
      { kind: 'value', file: HOST, name: 'IDLE_SECONDS', equals: 1800 },
      { kind: 'string', file: HOST, includes: 'twitterApi' },
      { kind: 'string', file: HOST, includes: 'platformKit' },
      { kind: 'string', file: HOST, includes: 'twikit' },
      { kind: 'symbol', file: HOST, name: 'code_stamp' },
    ],
    'REQ-XSESSION-11': [
      { kind: 'symbol', file: HOST, name: 'pid_alive' },
      { kind: 'symbol', file: HOST, name: 'ensure_host' },
    ],
    'REQ-XSESSION-13': [
      { kind: 'string', file: ENGINE, includes: 'https://x.com/home' },
      { kind: 'string', file: ENGINE, includes: 'xOperations.json' },
      { kind: 'symbol', file: ENGINE, name: 'web_client' },
      { kind: 'symbol', file: ENGINE, name: 'live_operations_of' },
    ],
    'REQ-XSESSION-15': [
      { kind: 'symbol', file: ENGINE, name: 'save_xchat_build' },
      { kind: 'symbol', file: ENGINE, name: 'xchat_build_of' },
      { kind: 'symbol', file: ENGINE, name: 'xchat_scripts_of' },
      { kind: 'string', file: ENGINE, includes: 'https://chat.x.com/embed-v1.json' },
    ],
    'REQ-XSESSION-14': [
      { kind: 'symbol', file: GQL, name: 'live_call' },
      { kind: 'symbol', file: GQL, name: 'set_live_operations' },
      { kind: 'symbol', file: ENGINE, name: 'load_live_operations' },
    ],
  },
  rubrics: {
    'REQ-XSESSION-01': noul('Does client_for make the twikit Client without passing any proxy, and does runTwitterEngine write an engine spec that carries no proxy?'),
    'REQ-XSESSION-02': noul('Does the twikit Client set self.http to a curl_cffi AsyncSession whose impersonate defaults to IMPERSONATE and whose allow_redirects defaults to False?'),
    'REQ-XSESSION-03': noul('Does run take the AccountLock for every action that is not in UNLOCKED before it calls run_locked, hold it until run_locked returns, and return accountBusy without calling run_locked when AccountBusy is raised?'),
    'REQ-XSESSION-04': noul('Does spacing_wait draw the gap from READ_SPACING_SECONDS when the action is in READS and from SPACING_SECONDS otherwise, does run sleep that long inside the lock before the call, and does it call mark_call after the call even when the call fails?'),
    'REQ-XSESSION-05': noul('Does run_locked call keep_transaction after the call, and does restore_transaction return False without restoring when the saved state is older than TRANSACTION_SECONDS?'),
    'REQ-XSESSION-06': noul('Does main send every spec that is not a governorStatus request through host.call, and run it inline with run only when LOG_TWITTER_HOST is inline?'),
    'REQ-XSESSION-07': noul('When HOSTING is True, does client_for store the client in SESSIONS and return the held client for a later call whose auth_token cookie is the same?'),
    'REQ-XSESSION-08': noul('Does Host.serve take an AccountLock on host.lock before it starts its server, and return without serving when AccountBusy is raised?'),
    'REQ-XSESSION-09': noul('When connect_host returns no socket, does call return the host-down refusal without calling the engine run or opening a client of its own?'),
    'REQ-XSESSION-10': noul('Does Host.serve stop when idle for more than IDLE_SECONDS with no active call, and stop when code_stamp changes while every active call is a watch (active equals watching)?'),
    'REQ-XSESSION-11': noul('When socket.create_connection to the host port raises OSError on the first attempt, does connect_host wait while pid_alive is true for that host pid, up to START_WAIT_SECONDS, and then make a second attempt that calls ensure_host, which starts a new host once the old one is gone?'),
    'REQ-XSESSION-12': noul('In the finally block of Host.serve, does it remove host.json when it is its own, close the server, close every writer in self.writers and release the host.lock?'),
    'REQ-XSESSION-13': noul('Does web_client load the x.com home page with the session client, save the page and its scripts, and write the result of live_operations_of to operations_path when it found operations?'),
    'REQ-XSESSION-15': noul('In python/twitterApi/engine.py, does web_client call save_xchat_build with READ_SPACING_SECONDS after saving the x.com scripts and include its ok, build and file count in its answer; does save_xchat_build request XCHAT_EMBED_MANIFEST through client.http, take the build with xchat_build_of from the metaData remoteEntry name and publicPath, and for each url from xchat_scripts_of sleep a random spacing before requesting it through client.http and write it into the xchat folder; and does xchat_scripts_of add the remoteEntry name and every .js name in exposes, skip locale files matching XCHAT_LOCALE other than en, and prefix them with the public path?'),
    'REQ-XSESSION-14': noul('Do gql_get and gql_post call live_call, which replaces the query id with the live queryId for the operation and sets features to exactly the live operation feature list with the values from featureValues, and does client_for call load_live_operations before making a client?'),
    unspecifiedBehavior: noul('Is there a path where an X call is sent with a proxy, without the account lock, without spacing, or through a second session the specification does not describe?'),
  },
  assertions: {
    'REQ-XSESSION-01': MET,
    'REQ-XSESSION-02': MET,
    'REQ-XSESSION-03': MET,
    'REQ-XSESSION-04': MET,
    'REQ-XSESSION-05': MET,
    'REQ-XSESSION-06': MET,
    'REQ-XSESSION-07': MET,
    'REQ-XSESSION-08': MET,
    'REQ-XSESSION-09': MET,
    'REQ-XSESSION-10': MET,
    'REQ-XSESSION-11': MET,
    'REQ-XSESSION-12': MET,
    'REQ-XSESSION-13': MET,
    'REQ-XSESSION-14': MET,
    'REQ-XSESSION-15': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}

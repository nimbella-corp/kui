/*
 * Copyright 2019 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ISuite } from '@kui-shell/core/tests/lib/common'
import * as common from '@kui-shell/core/tests/lib/common'
import * as ui from '@kui-shell/core/tests/lib/ui'
import { tabby, tabbyWithOptions } from '@kui-shell/plugin-core-support/tests/lib/tab-completion-util'
import { dirname } from 'path'
import { createNS, allocateNS, deleteNS } from '@kui-shell/plugin-k8s/tests/lib/k8s/utils'
import { selectors } from '@kui-shell/core/tests/lib/ui'

const { cli } = ui
const ROOT = dirname(require.resolve('@kui-shell/plugin-k8s/tests/package.json'))
const synonyms = ['kubectl']

describe('Tab completion for kubectl get', function (this: ISuite) {
  before(common.before(this))
  after(common.after(this))

  synonyms.forEach(kubectl => {
    const ns: string = createNS()

    allocateNS(this, ns)
    it(`should create sample pod from URL via ${kubectl}`, () => {
      return cli.do(`${kubectl} create -f https://raw.githubusercontent.com/kubernetes/examples/master/staging/pod -n ${ns}`, this.app)
        .then(cli.expectOKWithCustom({ selector: selectors.BY_NAME('nginx') }))
        .then(selector => this.app.client.waitForExist(`${selector} badge.green-background`))
        .catch(common.oops(this))
    })

    it(`should create tab-completion pod via ${kubectl}`, async () => {
      return cli.do(`${kubectl}  create -f ${ROOT}/data/k8s/tab-completion.yaml -n ${ns}`, this.app)
        .then(cli.expectOKWithCustom({ selector: selectors.BY_NAME('tab-completion-1') }))
        .then(selector => this.app.client.waitForExist(`${selector} badge.green-background`))
        .catch(common.oops(this))
    })

    it(`should create tab-completion2 pod via ${kubectl}`, async () => {
      return cli.do(`${kubectl}  create -f ${ROOT}/data/k8s/tab-completion-2.yaml -n ${ns}`, this.app)
        .then(cli.expectOKWithCustom({ selector: selectors.BY_NAME('tab-completion-2') }))
        .then(selector => this.app.client.waitForExist(`${selector} badge.green-background`))
        .catch(common.oops(this))
    })

    it(`should tab complete pods`, () => {
      return tabby(this.app,
        `k get pods -n ${ns} n`,
        `k get pods -n ${ns} nginx`)
    })

    it(`should tab complete pods not unique`, () => {
      return tabbyWithOptions(this.app,
        `k get pods -n ${ns} t`,
        [`tab-completion-1`, `tab-completion-2`],
        `k get pods -n ${ns} tab-completion-1`,
        {
          click: 0,
          expectedPromptAfterTab: `k get pods -n ${ns} tab-completion-`
        })
    })
    deleteNS(this, ns)
  })
})
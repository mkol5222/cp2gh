<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div>Policy Page: {{ policyPackage }} ({{ policyAccessLayerUid }})</div>

      <div v-for="(rules, policyPartKey) of simplePolicy" :key="policyPartKey">
        <q-separator />

        <div class="q-pa-md">
          <q-markup-table>
            <thead>
              <tr>
                <div class="row no-wrap items-center">
                  <div class="text-h5 q-ml-md">{{ policyPartKey }}</div>
                </div>
              </tr>
              <tr>
                <th class="text-left">Name</th>
                <th class="text-left">Source</th>
                <th class="text-left">Destination</th>
                <th class="text-left">Services</th>
                <th class="text-left">Install On</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rule, index) in rules" :key="`rule-${index}`">
                <td>{{ rule.name }}</td>
                <td>
                  <q-chip
                    v-for="oneSource in rule.source"
                    :key="oneSource"
                    outline
                    color="primary"
                    text-color="white"
                    icon="event"
                  >
                    {{ oneSource }}
                  </q-chip>
                </td>
                <td>
                  <q-chip
                    v-for="oneDestination in rule.destination"
                    :key="oneDestination"
                    outline
                    color="primary"
                    text-color="white"
                    icon="lan"
                  >
                    {{ oneDestination }}
                  </q-chip>
                </td>
                <td>
                  <q-chip
                    v-for="svc in rule.services"
                    :key="svc"
                    outline
                    color="primary"
                    text-color="white"
                    icon="notes"
                  >
                    {{ svc }}
                  </q-chip>
                </td>
                <td>
                  <q-chip
                    v-for="installTarget in rule.installOn"
                    :key="installTarget"
                    outline
                    color="primary"
                    text-color="white"
                    icon="computer"
                  >
                    {{ installTarget }}
                  </q-chip>
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>

      <q-banner
        inline-actions
        class="text-white bg-red"
        v-if="errorMessage"
        icon="warning"
      >
        <template v-slot:action>
          <q-btn
            @click="errorMessage = ''"
            flat
            color="white"
            label="Dismiss"
          />
        </template>
        {{ errorMessage }}
      </q-banner>
      <q-btn label="Get Context" @click="getContext"> </q-btn>
      <q-input
        v-model="contextOut"
        label="Context"
        type="textarea"
        :rows="10"
        :autofocus="true"
        readonly
      >
      </q-input>

      <q-btn v-if="policyPackage" label="Get Policy" @click="getPolicy">
      </q-btn>
      <q-input
        v-model="accessPolicyOut"
        label="Policy"
        type="textarea"
        :rows="10"
        :autofocus="true"
        readonly
      >
      </q-input>

      <q-input
        v-if="rulebase"
        v-model="rulebaseOut"
        label="Rulebase"
        type="textarea"
        :rows="10"
        :autofocus="true"
        readonly
      >
      </q-input>

      <q-input
        v-if="objectsDictionary"
        v-model="objectsDictionaryOut"
        label="Objects Dictionary"
        type="textarea"
        :rows="10"
        :autofocus="true"
        readonly
      >
      </q-input>

      <q-btn
        v-if="policyObj"
        label="Send policy.json to GitHub"
        @click="sendToGithub"
      ></q-btn>

      <q-input
        v-if="sendToGithubResult"
        v-model="sendToGithubResult"
        label="Send to GitHub Result"
        type="textarea"
        :rows="10"
        :autofocus="true"
        readonly
      >
      </q-input>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { getSmartConsoleContext, showAccessRulebase } from '../client/cp.ts';
import { savePolicyToGithub } from '../client/gh.ts';
import { ref, computed } from 'vue';
import {
  flattenRulebase,
  //mockupData,
  processRulebase,
} from '../client/cputils.ts';

// console.log('AAA PolicyPage: mockupData 123', mockupData);

const contextObj = ref({});
const errorMessage = ref('');

const sendToGithubResult = ref('');

const accessPolicyObj = ref({});

const contextOut = computed(() => {
  return JSON.stringify(contextObj.value, null, 2);
});

const accessPolicyOut = computed(() => {
  return JSON.stringify(accessPolicyObj.value, null, 2);
});

const rulebaseOut = computed(() => {
  return JSON.stringify(rulebase.value, null, 2);
});

const objectsDictionaryOut = computed(() => {
  return JSON.stringify(objectsDictionary.value, null, 2);
});

const policyPackage = computed(() => {
  return contextObj.value
    ? contextObj.value?.event?.objects?.find((o) => o.type === 'AccessPolicy')
        ?.name
    : '';
});

const policyAccessLayerUid = computed(() => {
  return contextObj.value
    ? contextObj.value?.event?.objects?.find((o) => o.type === 'access-layer')
        ?.uid
    : '';
});

const rulebase = computed(() => {
  return accessPolicyObj.value?.response
    ? accessPolicyObj.value?.response?.rulebase
    : [];
});

const objectsDictionary = computed(() => {
  return accessPolicyObj.value?.response
    ? accessPolicyObj.value?.response['objects-dictionary']
    : [];
});

const simplePolicy = computed(() => {
  return processRulebase(rulebase.value, objectsDictionary.value);
});

const policyObj = computed(() => {
  const processedRulebase = processRulebase(
    rulebase.value,
    objectsDictionary.value
  );

  return contextObj.value && rulebase.value && objectsDictionary.value
    ? {
        rulebase: rulebase.value,
        objectsDictionary: objectsDictionary.value,
        context: contextObj.value,
        flatRulebase: flattenRulebase(rulebase.value),
        processedRulebase,
      }
    : null;

  console.log('processedRulebase', processedRulebase);
});

async function getContext() {
  console.log(' getContext: before getSmartConsoleContext', typeof smxProxy);
  try {
    contextObj.value = await getSmartConsoleContext();
  } catch (e) {
    errorMessage.value = e?.message;
  }
}

async function getPolicy() {
  try {
    accessPolicyObj.value = await showAccessRulebase(
      policyAccessLayerUid.value
    );
  } catch (err) {
    errorMessage.value = err?.message;
  }
}

async function sendToGithub() {
  console.log('sendToGithub: policyObj', policyObj.value);
  try {
    const result = await savePolicyToGithub(policyObj.value);
    console.log('sendToGithub: result', result);
    sendToGithubResult.value = JSON.stringify(result, null, 2);
  } catch (err) {
    errorMessage.value = err?.message;
  }
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div>Policy Page: {{ policyPackage }} ({{ policyAccessLayerUid }})</div>
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
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { getSmartConsoleContext, showAccessRulebase } from '../client/cp.ts';
import { savePolicyToGithub } from '../client/gh.ts';
import { ref, computed } from 'vue';

const contextObj = ref({});
const errorMessage = ref('');

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
    ? accessPolicyObj.value.response['objects-dictionary']
    : [];
});

const policyObj = computed(() => {
  return rulebase.value && objectsDictionary.value
    ? { rulebase: rulebase.value, objectsDictionary: objectsDictionary.value }
    : null;
});



async function getContext() {
  try {
    contextObj.value = await getSmartConsoleContext();
  } catch (e) {
    errorMessage.value = e.message;
  }
}

async function getPolicy() {
  try {
    accessPolicyObj.value = await showAccessRulebase(
      policyAccessLayerUid.value
    );
  } catch (err) {
    errorMessage.value = err.message;
  }
}

async function sendToGithub() {
  console.log('sendToGithub: policyObj', policyObj.value);
  try {
    await savePolicyToGithub(policyObj.value);
  } catch (err) {
    errorMessage.value = err.message;
  }
}
</script>

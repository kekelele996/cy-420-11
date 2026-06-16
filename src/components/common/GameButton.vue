<template><van-button type="primary" round @click="$emit('click')"><slot /></van-button></template><script setup lang="ts">defineEmits<{ click: [] }>();</script>

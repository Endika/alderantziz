export function reverseChannels(channels: readonly Float32Array[]): Float32Array<ArrayBuffer>[] {
  return channels.map((channel) => channel.slice().reverse())
}

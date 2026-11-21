export const MODEL_SOURCES = ['huggingFace', 'pip'] as const

export type ModelSource = (typeof MODEL_SOURCES)[number]

export const MODEL_LOADERS = ['huggingfaceHub', 'transformersJs', 'pip'] as const

export type ModelLoader = (typeof MODEL_LOADERS)[number]

export const MODEL_KEYS = ['judge', 'embed', 'emotion', 'vision', 'mouse', 'facts'] as const

export type ModelKey = (typeof MODEL_KEYS)[number]

export interface ModelFile {
  path: string
  size: number
  sha256?: string
  gitSha1?: string
}

export interface LocalModel {
  key: ModelKey
  id: string
  purpose: string
  source: ModelSource
  loader: ModelLoader
  revision: string
  process: string
  files: ModelFile[]
  bytes: number
}

export const LOCAL_MODELS: readonly LocalModel[] = [
  {
    key: 'judge',
    id: 'patronus-studio/wolf-defender-prompt-injection-small',
    purpose: 'prompt-injection score for what other people wrote, before an agent reads it',
    source: 'huggingFace',
    loader: 'huggingfaceHub',
    revision: '2484cc9a13550aa4f2c29b577ff3ef331dc6ba07',
    process: 'the judge server (python/judge/server.py)',
    files: [
      { path: 'onnx/int8_int4_embeddings_x86/model.onnx', size: 107277292, sha256: '6f95e8c366483e377837dbb205eefaf6d4beb3f1b1742966ef063d7238bd97ab' },
      { path: 'tokenizer.json', size: 34363188, sha256: '609d8f4c067cd3950f88594c5a802616cea245823836ef5848ee4fc40aab5b6f' },
      { path: 'tokenizer_config.json', size: 574, gitSha1: '4a835ec4c4feccf7462f2f8c590b5f3ce08e1eb3' },
      { path: 'config.json', size: 2065, gitSha1: '84db466ef660d8ae4ba0d10e738d1e02337d994e' },
      { path: 'special_tokens_map.json', size: 173, gitSha1: '1af6a777b1079e629ef1f37769774f2aa0519d3e' },
    ],
    bytes: 141643292,
  },
  {
    key: 'embed',
    id: 'Xenova/all-MiniLM-L6-v2',
    purpose: 'meaning vectors for the conversation search and the prompt router',
    source: 'huggingFace',
    loader: 'transformersJs',
    revision: '751bff37182d3f1213fa05d7196b954e230abad9',
    process: 'the embed worker (warm context service, search, router)',
    files: [
      { path: 'config.json', size: 650, gitSha1: '72147e4ff4426ebedbfa2146c4a0999def51a313' },
      { path: 'tokenizer.json', size: 711661, gitSha1: 'c17ed520ed8438736732a54957a69306b8822215' },
      { path: 'tokenizer_config.json', size: 366, gitSha1: '37fca74771bc76a8e01178ce3a6055a0995f8093' },
      { path: 'onnx/model_quantized.onnx', size: 22972370, sha256: 'afdb6f1a0e45b715d0bb9b11772f032c399babd23bfc31fed1c170afc848bdb1' },
    ],
    bytes: 23685047,
  },
  {
    key: 'emotion',
    id: 'SamLowe/roberta-base-go_emotions-onnx',
    purpose: 'the top emotions of each new inbound message, a feature for who and where',
    source: 'huggingFace',
    loader: 'transformersJs',
    revision: '90ee0c1c4796d370e68968687b8ba51fc11224f4',
    process: 'the pipeline labeller in the inbox push (emotion worker)',
    files: [
      { path: 'config.json', size: 1924, gitSha1: 'a9d71647a2250ff0d6e4e0d790054415231b4ebe' },
      { path: 'tokenizer.json', size: 2108856, gitSha1: 'd535bff2abebc2741089c8d653ff4254a6bccc83' },
      { path: 'tokenizer_config.json', size: 380, gitSha1: '2dafa1f1f31d5838218326dd0abe5ec002587516' },
      { path: 'onnx/model_quantized.onnx', size: 125397543, sha256: '0c1981c5b479674747911c8e2228f0c4ec90bf47bf66e830f7d4fc62be082958' },
    ],
    bytes: 127508703,
  },
  {
    key: 'vision',
    id: 'onnx-community/LFM2.5-VL-450M-ONNX',
    purpose: 'describes images, memes and video frames as text',
    source: 'huggingFace',
    loader: 'transformersJs',
    revision: '24e63007ff1aaafbde27c89eb01a0513f4f61482',
    process: 'the media describer (log media describer)',
    files: [
      { path: 'config.json', size: 2637, gitSha1: '21fc9da67ed946b25e00ed29a413dd01a3ed1516' },
      { path: 'generation_config.json', size: 136, gitSha1: 'd0f38b4f54516df3595d6c761387c66383596653' },
      { path: 'preprocessor_config.json', size: 729, gitSha1: 'ce7b7db16c7a109946c79b6c4a3ba4e7ba7e788d' },
      { path: 'tokenizer.json', size: 3297554, gitSha1: '65e32d677fce1f59b09f0f1197e32b61dbf89881' },
      { path: 'tokenizer_config.json', size: 5440, gitSha1: '93cadf365453114ba4c3d602e37870a20bb452a2' },
      { path: 'onnx/embed_tokens_q4.onnx', size: 853, sha256: 'f0d663cbf75fc6a0c7b9669177335139b0c5a63575c6413037d48501eea0c4a5' },
      { path: 'onnx/embed_tokens_q4.onnx_data', size: 42991616, sha256: '255994cbb7269ea24b43d3d57a7e64dcb54da69c77ea612f9c32af3dbb95158e' },
      { path: 'onnx/vision_encoder_q4.onnx', size: 184713, sha256: '3457fe118939ecd52183660abafbbd32c810f41a0e8d1119a1f07ca2d4d9dcfc' },
      { path: 'onnx/vision_encoder_q4.onnx_data', size: 61450240, sha256: '03171ff302af006d2e5f55f9c09531d7938565626334809c94e6de54afc840b5' },
      { path: 'onnx/decoder_model_merged_q4.onnx', size: 187425, sha256: '00b4c0ed1008194b6ed813e5d17724db122ef71e963197424022aaf93966515a' },
      { path: 'onnx/decoder_model_merged_q4.onnx_data', size: 260075520, sha256: '0440e6e97953a70705ef1901cb1267bc80cb69ae7d4ca25010891c5770e989d5' },
    ],
    bytes: 368196863,
  },
  {
    key: 'mouse',
    id: 'myuri',
    purpose: 'plans human mouse paths, typing and scrolling for the browsers',
    source: 'pip',
    loader: 'pip',
    revision: '5.0.0',
    process: 'every browser session in LOG_PYTHON (python/human)',
    files: [],
    bytes: 0,
  },
  {
    key: 'facts',
    id: 'fastino/gliner2.5-small-v1',
    purpose: 'marks messages that carry a lasting fact or a promise, with the slot, the people and things named (person facts, tier 1)',
    source: 'huggingFace',
    loader: 'huggingfaceHub',
    revision: 'b5d42bf7dc7d01c40304ae4ed43c2f13c325a75b',
    process: 'the fact screen (python/facts/screen.py), started by log people facts extract',
    files: [
      { path: 'config.json', size: 4104, gitSha1: 'cfd76c9f59461050dd1c00ac0b670eaac7d1495d' },
      { path: 'encoder_config/config.json', size: 856, gitSha1: 'cdaf6bb43684ee0c7623598df371099ed8b453e6' },
      { path: 'model.safetensors', size: 295567700, sha256: '4ee982787ace270d4bf15dbcb28ced38e0aa201372347114ceedd6336055de2b' },
      { path: 'tokenizer.json', size: 8341713, gitSha1: 'a93077b30f99647415b09c3534fed78681ffc853' },
      { path: 'tokenizer_config.json', size: 645, gitSha1: '5efd586306801b08ca13390b0619a94c943046e4' },
    ],
    bytes: 303915018,
  },
]

export const HF_ENDPOINT = 'https://huggingface.co'

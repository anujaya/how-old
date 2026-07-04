# Photo sources

Maps each repo photo file to the original upload filename and a SHA-256 of
that *original* (pre-resize/recompress) file. Lets future additions be
checked for duplicates by filename/hash lookup instead of visually
comparing images.

When adding a new photo (see CLAUDE.md's "Adding new photos" section):
1. Before processing, hash the original: `sha256sum <original-file>`.
2. Check the hash and filename below for a match. No match -> not a
   byte-for-byte duplicate (still worth a quick visual glance for
   near-duplicate burst shots, but no AI image comparison required).
3. Process and save as the next `<cat>-N.jpg`, then append a row here.

## Kiki

| Repo file     | Original filename                                          | SHA-256 (original) |
|---------------|-------------------------------------------------------------|---------------------|
| kiki-1.jpg    | unknown / predates this log                                 | — |
| kiki-2.jpg    | unknown / predates this log                                 | — |
| kiki-3.jpg    | unknown / predates this log                                 | — |
| kiki-4.jpg    | unknown / predates this log                                 | — |
| kiki-5.jpg    | unknown / predates this log                                 | — |
| kiki-6.jpg    | unknown / predates this log                                 | — |
| kiki-7.jpg    | 1000015236.jpg                                               | c19619fad925843b14b342a83052366af1426fd0ff2e4ed04f2724f06151e973 |
| kiki-8.jpg    | 1000015021.jpg                                               | bcaa82ae7adbcf790d8714154bf8cf9c62af80b432e9fdbe0030bf076759a0eb |
| kiki-9.jpg    | d92cc6eb575d4f5db3178de49b062cea1_all_27286.jpg              | b87e3838040599c5ff7bce2c96be77ae5c643b1585ed2139d8102cabb18b3541 |
| kiki-10.jpg   | d92cc6eb575d4f5db3178de49b062cea1_all_23938.jpg              | 8cbfa3fe380fb03697708b08992119e6eee09bc67798fa57151b3066f4d01b7f |
| kiki-11.jpg   | d92cc6eb575d4f5db3178de49b062cea1_all_21215.jpg              | dfeb3a99d05475d94530b80590cf15c4763a30d5a4d180e1df19dda2a919e4a2 |
| kiki-12.jpg   | d92cc6eb575d4f5db3178de49b062cea1_all_19900.jpg              | f42030faeb727f442a4154e387470e68b6c51ccbf5c48e3217f0794f53fb07aa |
| kiki-13.jpg   | d92cc6eb575d4f5db3178de49b062cea1_all_19861.jpg (near-dup burst of kiki-4.jpg) | 402d597145c30cee3e764d3be5b267ec7a2440e41aa56813c410f8bf81014c15 |
| kiki-14.jpg   | d92cc6eb575d4f5db3178de49b062cea1_all_19801.jpg              | 9a046e0d0cd0169457643301de1e303f7b0907d922e5ad06742ff16cac089e4d |
| kiki-15.jpg   | d92cc6eb575d4f5db3178de49b062cea1_all_19773.jpg (near-dup burst of kiki-5.jpg, pair w/ kiki-16.jpg) | 7413224cabbc6c75a7939d44e26213edcddbd2749fc09922533c5ab2e8d08dc1 |
| kiki-16.jpg   | d92cc6eb575d4f5db3178de49b062cea1_all_19774.jpg (near-dup burst of kiki-5.jpg, pair w/ kiki-15.jpg) | 3ca1218f8830c02bc50f408c09ed31a3860b3785dddb6c2be4bba690be394417 |
| kiki-17.jpg   | d92cc6eb575d4f5db3178de49b062cea1_all_19412.jpg              | f3b182e50538beda6f7d4fdb412b0de166915892c11a2f5ac3844f816f7179c2 |
| kiki-18.jpg   | d92cc6eb575d4f5db3178de49b062cea1_all_19348.jpg              | 8f6b47f203f02ee38e09711a04873f288978553c926f84bcdd257a69994a2ae7 |
| kiki-19.jpg   | 1000016767.jpg                                               | e67b9201f39f7621e86cf519ee8deec9f13123f81dc95a3797c5c1d32d381211 |
| kiki-20.jpg   | d92cc6eb575d4f5db3178de49b062cea1_all_222.jpg                | fd3eb89a45c47de84beff6672bb2590468536324cd9689bdc78c3bed777254d7 |

## Knixie

| Repo file       | Original filename            | SHA-256 (original) |
|-----------------|-------------------------------|---------------------|
| knixie-1.jpg    | unknown / predates this log   | — |
| knixie-2.jpg    | unknown / predates this log   | — |
| knixie-4.jpg    | unknown / predates this log   | — |
| knixie-5.jpg    | unknown / predates this log   | — |
| knixie-6.jpg    | 1000016894.jpg                 | 66c230e339732e4ef6d3182d297b8fd31ae985a32fdf005d8502e2c94fbf06f6 |
| knixie-7.jpg    | 1000016830.jpg                 | b6cc51ce3c51dd9d67b74b70d4393ee4c498bc70fc72fb9e12f9283781bcbe92 |
| knixie-8.jpg    | 1000016786.jpg                 | 227559cff5cdf252340303955cf4aeb43aa1ad76651cec8f2100d426bc31affa |
| knixie-9.jpg    | 1000016779.jpg                 | d5f5545a38b0c1621399820a138caf51a36532f25c20ce717c4dda8ba97190ca |
| knixie-10.jpg   | 1000016777.jpg                 | 2006eb907bee99f39eab6eb1750004c9c77e05194ef163437f48497811652479 |
| knixie-11.jpg   | 1000016778.jpg                 | 50d8ba8645ad8c393aee44695d927d2f927ed3cf42157d2ea26ffbbfbd1bd891 |
| knixie-12.jpg   | 1000016770.jpg                 | 713f850dd020e7a7cb995fc4d170cdf275d5c0d4b19284725a4e9ca8a8a58452 |
| knixie-13.jpg   | 1000016682.jpg                 | dfc2f8d2a417547c846ff3212ffee8820dd7a13f3c026e77384d702301513d06 |

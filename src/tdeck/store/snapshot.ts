// import { create } from "zustand";
// import { db, type Snapshot } from "@/utils/database";
// import { useMainStore } from "./main";
// import type { IndexableTypeArray } from "dexie";
// import type { Slide } from "@/types";

// interface SnapshotState {
//   snapshotCursor: number;
//   snapshotLength: number;
// }

// interface SnapshotActions {
//   setSnapshotCursor: (cursor: number) => void;
//   setSnapshotLength: (length: number) => void;
//   initSnapshotDatabase: () => Promise<void>;
//   addSnapshot: () => Promise<void>;
//   unDo: () => Promise<void>;
//   reDo: () => Promise<void>;
// }

// interface SnapshotGetters {
//   canUndo: () => boolean;
//   canRedo: () => boolean;
// }

// export const useSnapshotStore = create<
//   SnapshotState & SnapshotActions & SnapshotGetters
// >((set, get) => ({
//   snapshotCursor: -1, // 历史快照指针
//   snapshotLength: 0, // 历史快照长度

//   canUndo: () => get().snapshotCursor > 0,

//   canRedo: () => get().snapshotCursor < get().snapshotLength - 1,

//   setSnapshotCursor: (cursor) =>
//     set(() => ({
//       snapshotCursor: cursor,
//     })),

//   setSnapshotLength: (length) =>
//     set(() => ({
//       snapshotLength: length,
//     })),

//   initSnapshotDatabase: async () => {
//     const slidesStore = useStore.getState();
//     const newFirstSnapshot: Snapshot = {
//       index: slidesStore.slideIndex,
//       slides: JSON.parse(JSON.stringify(slidesStore.slides)),
//     };
//     await db.snapshots.add(newFirstSnapshot);
//     set({ snapshotCursor: 0, snapshotLength: 1 });
//   },

//   addSnapshot: async () => {
//     const slidesStore = useStore.getState();
//     const allKeys = await db.snapshots.orderBy("id").keys();
//     let needDeleteKeys: IndexableTypeArray = [];

//     if (get().snapshotCursor >= 0 && get().snapshotCursor < allKeys.length - 1) {
//       needDeleteKeys = allKeys.slice(get().snapshotCursor + 1);
//     }

//     const snapshot: Snapshot = {
//       index: slidesStore.slideIndex,
//       slides: JSON.parse(JSON.stringify(slidesStore.slides)),
//     };
//     await db.snapshots.add(snapshot);

//     let snapshotLength = allKeys.length - needDeleteKeys.length + 1;
//     const snapshotLengthLimit = 20;

//     if (snapshotLength > snapshotLengthLimit) {
//       needDeleteKeys.push(allKeys[0]);
//       snapshotLength--;
//     }

//     if (snapshotLength >= 2) {
//       await db.snapshots.update(allKeys[snapshotLength - 2] as number, {
//         index: slidesStore.slideIndex,
//       });
//     }

//     await db.snapshots.bulkDelete(needDeleteKeys as number[]);
//     set({ snapshotCursor: snapshotLength - 1, snapshotLength });
//   },

//   unDo: async () => {
//     if (get().snapshotCursor <= 0) return;

//     //const slidesStore = useStore.getState();
//     const mainStore = useMainStore.getState();
//     const snapshotCursor = get().snapshotCursor - 1;
//     const snapshots: Snapshot[] = await db.snapshots.orderBy("id").toArray();
//     const snapshot = snapshots[snapshotCursor];
//     const { index, slides } = snapshot;

//     const slideIndex = index > slides.length - 1 ? slides.length - 1 : index;

//     useStore.setState({
//       slides: slides as Slide[],
//       slideIndex,
//     });
//     //mainStore.setActiveElementIdList([]);
//     set({ snapshotCursor });
//   },

//   reDo: async () => {
//     if (get().snapshotCursor >= get().snapshotLength - 1) return;

//     //const slidesStore = useStore.getState();
//     //const mainStore = useMainStore.getState();
//     const snapshotCursor = get().snapshotCursor + 1;
//     const snapshots: Snapshot[] = await db.snapshots.orderBy("id").toArray();
//     const snapshot = snapshots[snapshotCursor];
//     const { index, slides } = snapshot;

//     const slideIndex = index > slides.length - 1 ? slides.length - 1 : index;

//     useStore.setState({
//       slides: slides as Slide[],
//       slideIndex,
//     });
//     //mainStore.setActiveElementIdList([]);
//     set({ snapshotCursor });
//   },
// }));

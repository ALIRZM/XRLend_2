/**
 * IFN636 Assessment 2
 * Design Pattern: Adapter Pattern
 * OOP Concept: Composition
 * Adapts headset persistence data into the representation required by the Admin headset view.
 */

class HeadsetAdminAdapter {
  constructor(headset, activeHeadsetIds) {
    this.headset = headset;
    this.activeHeadsetIds = activeHeadsetIds;
  }

  toAdminView() {
    return {
      ...this.headset,
      hasActiveLoan: this.activeHeadsetIds.has(String(this.headset._id)),
    };
  }

  static adaptMany(headsets, activeLoans) {
    const activeHeadsetIds = new Set(
      activeLoans.map((loan) => String(loan.headset))
    );

    return headsets.map((headset) =>
      new HeadsetAdminAdapter(headset, activeHeadsetIds).toAdminView()
    );
  }
}

module.exports = HeadsetAdminAdapter;
export interface FairnessRow {
  parentId: string
  parentName: string
  driveCount: number
  lastDroveAt: Date | null
}

export interface FairnessReportResponse {
  perParent: FairnessRow[]
}

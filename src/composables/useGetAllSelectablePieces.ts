import type { Circle, Overlap } from '../types/types'
import { convertIdListToNameList } from '../utils/idToNameUtils'

const useGetAllSelectablePieces = (circles: Circle[], overlaps: Overlap[]) => {
  const circleIds = circles.map(circle => circle.id)
  const overlapIdList = overlaps.map(overlap => overlap.circles.map(circle => circle.id))
  const selectablePieces = convertIdListToNameList(circleIds).flat().map(name => [name])
  overlapIdList.forEach(overlapIds => selectablePieces.push(convertIdListToNameList(overlapIds)))
  return overlapIdList
}

export default useGetAllSelectablePieces
import { IFiber, IRef } from './type'
import { updateElement } from './dom'
import { isFn, LANE } from './reconcile'

export const commit = (fiber: IFiber): void => {
  let e = fiber.e
  fiber.e = null
  do {
    insert(e)
  } while ((e = e.e))
}

const insert = (fiber: IFiber): void => {
  if (fiber.lane === LANE.REMOVE) {
    remove(fiber)
    return
  }
  if (fiber.lane & LANE.UPDATE) {
    updateElement(fiber.node, fiber.oldProps || {}, fiber.props)
  }
  if (fiber.lane & LANE.INSERT) {
    fiber.parentNode.insertBefore(fiber.node, fiber.after)
  }
  refer(fiber.ref, fiber.node)
}

const refer = (ref: IRef, dom?: HTMLElement): void => {
  if (ref)
    isFn(ref) ? ref(dom) : ((ref as { current?: HTMLElement })!.current = dom)
}

const kidsRefer = (kids: any): void => {
  kids.forEach(kid => {
    kid.kids && kidsRefer(kid.kids)
    refer(kid.ref, null)
  })
}

const remove = d => {
  if (d.isComp) {
    d.hooks && d.hooks.list.forEach(e => e[2] && e[2]())
    d.kids.forEach(remove)
  } else {
    kidsRefer(d.kids)
    d.parentNode.removeChild(d.node)
    refer(d.ref, null)
  }
}

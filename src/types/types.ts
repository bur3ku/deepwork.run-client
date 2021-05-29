export type Deadline = {
  due: string,
  buffer: string
}

export type Task = {
  name: string,
  id: number,
  details: string,
  deadline: Deadline
}

export type TimeBlock = {
  id: number
  name: string,
  details: string,
  begin: string,
  end: string,
  deepwork: boolean
}

export type Template = {
  name: string,
  timeblocks: TimeBlock[]
}
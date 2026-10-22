import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vite-plus/test"
import { TimeDate } from "../src/components/TimeDate"

const now = new Date("2024-09-10T15:49:00")

function setup() {
  vi.useFakeTimers()
  vi.setSystemTime(now)
  return render(<TimeDate />)
}

describe("TimeDate", () => {
  it("should render current time", () => {
    setup()

    // Match the component's locale-dependent time format.
    const time = now.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "numeric",
      second: undefined,
    })

    expect(screen.getByText(time)).toBeVisible()
  })

  it("should render current date", () => {
    setup()

    // format: Wednesday, Sep 10
    const date = now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
    expect(screen.getByText(date)).toBeVisible()
  })
})

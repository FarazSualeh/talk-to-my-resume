let resumeText = ''

export function saveResumeText(text: string) {
  resumeText = text
}

export function getResumeText() {
  return resumeText
}

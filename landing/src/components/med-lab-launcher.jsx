import React from 'react'
import Button from './ui/button'
import { ExternalLink } from 'lucide-react'

const withTrailingSlash = (url) => {
    if (!url) return '/'
    return url.endsWith('/') ? url : url + '/'
}

export default function MedLabLauncher ({ medUrl, labUrl, className }) {
    const medHref = withTrailingSlash(medUrl || import.meta.env.VITE_MED_URL || '#')
    const labHref = withTrailingSlash(labUrl || import.meta.env.VITE_LAB_URL || 'http://localhost:5175')
    return (
        <div className={className}>
            <div className="flex items-center gap-3">
                <a href={medHref}>
                    <Button variant="gradient" aria-label="Ir a BACTRA MED" className="gap-2">
                        MED
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </a>
                <a href={labHref}>
                    <Button variant="outline" aria-label="Ir a BACTRA LAB" className="gap-2">
                        LAB
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </a>
            </div>
        </div>
    )
}



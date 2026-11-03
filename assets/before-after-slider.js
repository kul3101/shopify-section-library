if (!customElements.get('before-after-slider')) {
  customElements.define(
    'before-after-slider',
    class BeforeAfterSlider extends HTMLElement {
      connectedCallback() {
        if (this.controller) this.controller.abort();
        this.input = this.querySelector('.before-after-slider__input');
        if (!this.input) return;

        this.controller = new AbortController();
        const { signal } = this.controller;
        this.valueText = this.input.dataset.valueText;
        this.pointerId = null;
        this.dragging = false;
        this.update(Number(this.input.value), false);

        this.addEventListener('pointerdown', (event) => this.onPointerDown(event), { signal });
        this.addEventListener('pointermove', (event) => this.onPointerMove(event), { signal });
        this.addEventListener('pointerup', (event) => this.onPointerUp(event), { signal });
        this.addEventListener('pointercancel', (event) => this.onPointerCancel(event), { signal });
        this.addEventListener('lostpointercapture', (event) => this.onLostPointerCapture(event), { signal });
        this.addEventListener('dragstart', (event) => event.preventDefault(), { signal });
        this.input.addEventListener('input', () => this.update(Number(this.input.value), false), { signal });
      }

      disconnectedCallback() {
        if (this.controller) this.controller.abort();
        this.controller = null;
        this.pointerId = null;
        this.dragging = false;
      }

      onPointerDown(event) {
        if (!event.isPrimary) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;

        this.pointerId = event.pointerId;
        this.startPosition = this.position;
        this.setPointerCapture(event.pointerId);

        // Mouse jumps and drags at once. Touch and pen wait for a move or a tap,
        // so a vertical swipe that starts on the frame can still scroll the page.
        this.dragging = event.pointerType === 'mouse';
        if (this.dragging) this.moveTo(event.clientX);
      }

      onPointerMove(event) {
        if (event.pointerId !== this.pointerId) return;
        this.dragging = true;
        this.moveTo(event.clientX);
      }

      onPointerUp(event) {
        if (event.pointerId !== this.pointerId) return;
        if (!this.dragging) this.moveTo(event.clientX);
        this.endPointer();
      }

      onPointerCancel(event) {
        if (event.pointerId !== this.pointerId) return;
        if (this.dragging) this.update(this.startPosition, true);
        this.endPointer();
      }

      onLostPointerCapture(event) {
        if (event.pointerId === this.pointerId) this.endPointer();
      }

      endPointer() {
        this.pointerId = null;
        this.dragging = false;
      }

      moveTo(clientX) {
        const rect = this.getBoundingClientRect();
        if (!rect.width) return;
        const position = ((clientX - rect.left) / rect.width) * 100;
        this.update(Math.min(Math.max(position, 0), 100), true);
      }

      update(position, fromPointer) {
        this.position = position;
        this.style.setProperty('--before-after-position', `${position}%`);
        if (fromPointer) this.input.value = Math.round(position);
        if (this.valueText) {
          this.input.setAttribute('aria-valuetext', this.valueText.replace('[value]', this.input.value));
        }
      }
    },
  );
}
